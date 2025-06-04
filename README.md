# branchnamer

## Overview

Set aliases for your branch names.
No more guessing when working with conventions or hard-to-remember branch names.

## Features

- Set an alias for every branch you work on.

## Installation

Just install the extension from the VS Code Marketplace or clone the repository and run:

```bash
vsce package
```

Then install the generated `.vsix` file in your VS Code.

## Usage

To use branchnamer in your project, follow these steps:

1. After installing, open your project in VS Code. You should be prompted to generate a new `.extension.json` file.
   - If you don't see the prompt, just restart VS Code or run `Developer: Reload Window` from the Command Palette.
2. Open the `.extension.json` file and choose your preferred aliases.

```json
{
  "myBranchName": "my favorite alias",
  "anotherBranch": "another alias"
}
```

3. Save the file and use the command palette to run `Branchnamer: refresh` to apply your changes.

## Configuration

You can change the default name of the `.extension.json` file by adding a setting in your `settings.json`:

```json
{
  "branchnamer.defaultFileName": "myCustomConfig.json"
}
```

## Contributing

Contributions are welcome! Please open issues or submit pull requests on GitHub.

## License

MIT
