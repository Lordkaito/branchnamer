import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "branchnamer" is now active!');
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
  );
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  const config = vscode.workspace.getConfiguration('branchnamer');
  const configFileName =
    config.get<string>('defaultFileName') || '.extensions.json';

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    statusBarItem.text = 'No workspace folder found';
    return;
  }

  const workspacePath = workspaceFolders[0].uri.fsPath;

  let aliasMap: Record<string, string> = {};
  const configPath = path.join(workspacePath, configFileName);

  try {
    const fileContent = fs.readFileSync(configPath, 'utf8');
    aliasMap = JSON.parse(fileContent);
  } catch (error) {
    statusBarItem.text = `Error reading config file: ${error}`;
    vscode.window
      .showInformationMessage(
        `Config file ${configFileName} not found. Would you like to create it?`,
        'Yes',
        'No',
      )
      .then(async (selection) => {
        if (selection === 'Yes') {
          const configContent = JSON.stringify(
            { 'main-branch': 'main' },
            null,
            2,
          );
          try {
            const contentToIgnore = JSON.stringify('.extensions.json', null, 2);
            const gitIgnorePath = path.join(workspacePath, '.gitignore');
            if (fs.existsSync(gitIgnorePath)) {
              // Check if the content is already in the .gitignore file
              const gitIgnoreContent = fs.readFileSync(gitIgnorePath, 'utf8');
              if (!gitIgnoreContent.includes(contentToIgnore)) {
                fs.writeFileSync(
                  gitIgnorePath,
                  `${contentToIgnore}\n`,
                  { flag: 'a' }, // Append to the .gitignore file
                );
                console.log(`Added ${contentToIgnore} to .gitignore`);
              } else {
                console.log(`File is already in .gitignore`);
              }
            }
            fs.writeFileSync(configPath, configContent, 'utf8');
            vscode.window.showInformationMessage(
              `Config file ${configFileName} created successfully.`,
            );
          } catch (error) {
            vscode.window.showErrorMessage(
              `Error creating config file: ${error}`,
            );
          }
        }
      });
    console.error(`Error reading config file: ${error}`);
    return;
  }

  let currentBranch = '';
  try {
    currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: workspacePath,
    })
      .toString()
      .trim();
  } catch (error) {
    statusBarItem.text = `Error getting current branch: ${error}`;
    console.error(`Error getting current branch: ${error}`);
    return;
  }

  const alias = aliasMap[currentBranch] || currentBranch;
  statusBarItem.text = `Branch: ${alias}`;

  const disposable = vscode.commands.registerCommand(
    'branchnamer.refresh',
    () => {
      try {
        const newBranch = execSync('git rev-parse --abbrev-ref HEAD', {
          cwd: workspacePath,
        })
          .toString()
          .trim();
        const fileContent = fs.readFileSync(configPath, 'utf8');
        aliasMap = JSON.parse(fileContent);
        const alias = aliasMap[newBranch] || newBranch;
        statusBarItem.text = `Branch: ${alias}`;
        vscode.window.showInformationMessage('Updated branch alias');
      } catch (error) {
        statusBarItem.text = `Error getting current branch: ${error}`;
        console.error(`Error getting current branch: ${error}`);
        return;
      }
    },
  );
  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
