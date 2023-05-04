import * as vscode from "vscode";
import { Diagnostic, Range, DiagnosticSeverity, TextDocument } from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "helloworld" is now active!');

  let disposable = vscode.commands.registerCommand(
    "helloworld.helloWorld",
    () => {
      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor) {
        return;
      }

      const activeDocument = activeEditor.document;
      if (activeDocument.languageId !== "html") {
        vscode.window.showErrorMessage(
          "helloworld extension only works with HTML files"
        );
        return;
      }

      const decorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: "red",
      });

      const updateDiagnostics = (document: TextDocument): void => {
        const diagnostics: Diagnostic[] = [];
        let pattern =
          /<a\s+(?:[^>]*?\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'))?[^>]*?>/gi;
        let match: RegExpMatchArray | null;

        while ((match = pattern.exec(document.getText()))) {
          const href = match[1] || match[2];

          if (!href && match) {
            const start = document.positionAt(match.index!);
            const end = document.positionAt(match.index! + match[0].length);
            const range = new Range(start, end);
            const diagnostic = new Diagnostic(
              range,
              "Anchor tag without href attribute",
              DiagnosticSeverity.Error
            );
            diagnostics.push(diagnostic);
          }
        }

        activeEditor.setDecorations(decorationType, diagnostics);
      };

      updateDiagnostics(activeDocument);

      vscode.workspace.onDidChangeTextDocument((e) => {
        if (e.document === activeDocument) {
          updateDiagnostics(activeDocument);
        }
      });
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
