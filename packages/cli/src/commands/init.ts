import { Command } from "commander";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { log, logError } from "../utils.js";
import { initializeProjectDirectory } from "../project-bootstrap.js";

export const initCommand = new Command("init")
  .description("Initialize an InkOS project (current directory by default)")
  .argument("[name]", "Project name (creates subdirectory). Omit to init current directory.")
  .option("--lang <language>", "Default writing language: zh (Chinese), ko (Korean), or en (English)", "zh")
  .action(async (name: string | undefined, opts: { lang?: string }) => {
    const projectDir = name ? resolve(process.cwd(), name) : process.cwd();

    try {
      await mkdir(projectDir, { recursive: true });
      const lang = opts.lang === "en" ? "en" : opts.lang === "ko" ? "ko" : "zh";
      await initializeProjectDirectory(projectDir, {
        language: lang,
        overwriteSupportFiles: true,
      });

      log(`Project initialized at ${projectDir}`);
      log("");
      const exampleCreateLines = lang === "en"
        ? ["  inkos book create --title 'My Novel' --genre progression --platform royalroad --lang en"]
        : lang === "ko"
          ? ["  inkos book create --title '내 소설' --genre romance --platform naver --lang ko"]
          : [
            "  inkos book create --title '我的小说' --genre xuanhuan --platform tomato",
            "  # English project? Re-run with: inkos init --lang en",
            "  # Korean project? Re-run with: inkos init --lang ko",
          ];
      if (global) {
        log("Global LLM config detected. Ready to go!");
        log("");
        log("Next steps:");
        if (name) log(`  cd ${name}`);
        for (const line of exampleCreateLines) log(line);
      } else {
        log("Next steps:");
        if (name) log(`  cd ${name}`);
        log("  # Option 1: Set global config (recommended, one-time):");
        log("  inkos config set-global --provider openai --base-url <your-api-url> --api-key <your-key> --model <your-model>");
        log("  # Option 2: Edit .env for this project only");
        log("");
        for (const line of exampleCreateLines) log(line);
      }
      log("  inkos write next <book-id>");
    } catch (e) {
      logError(`Failed to initialize project: ${e}`);
      process.exit(1);
    }
  });
