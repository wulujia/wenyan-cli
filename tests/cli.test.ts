import { describe, it, mock, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createProgram } from "../src/cli.js";

describe("CLI Argument Parsing", () => {
    let program: ReturnType<typeof createProgram>;

    beforeEach(async () => {
        mock.restoreAll();
        program = createProgram("1.0.0");
        // 关键：防止 commander 在测试失败或调用 help 时直接退出进程
        program.exitOverride();
        // 重写 outputHelp 以避免输出
        mock.method(program, "outputHelp", mock.fn());
    });

    afterEach(() => {
        mock.restoreAll();
    });

    it("should verify version flag", () => {
        assert.equal(program.version(), "1.0.0");
    });

    it("should have publish command", () => {
        const commands = program.commands.map((cmd) => cmd.name());
        assert.ok(commands.includes("publish"));
    });

    it("should have render command", () => {
        const commands = program.commands.map((cmd) => cmd.name());
        assert.ok(commands.includes("render"));
    });

    it("should have theme command", () => {
        const commands = program.commands.map((cmd) => cmd.name());
        assert.ok(commands.includes("theme"));
    });

    it("should have serve command", () => {
        const commands = program.commands.map((cmd) => cmd.name());
        assert.ok(commands.includes("serve"));
    });

    it("should expose the serve API key file option", () => {
        const serveCommand = program.commands.find((cmd) => cmd.name() === "serve");

        assert.ok(serveCommand?.options.some((option) => option.long === "--api-key-file"));
    });

    it("should expose the publish API key file option", () => {
        const publishCommand = program.commands.find((cmd) => cmd.name() === "publish");

        assert.ok(publishCommand?.options.some((option) => option.long === "--api-key-file"));
    });

    it("should honor auto-cover options for local and remote publishing", () => {
        execFileSync(process.execPath, [
            "--experimental-test-module-mocks", "--import", "tsx", "--input-type=module", "-e",
            `
            import { mock } from "node:test";
            import assert from "node:assert/strict";
            import * as core from "@wenyan-md/core/wrapper";
            const inputs = [];
            const publish = (route) => async (content, options, getInput) => {
                inputs.push({ route, ...await getInput(content) });
                return "test-media-id";
            };
            mock.module("@wenyan-md/core/wrapper", { namedExports: {
                ...core,
                renderAndPublish: publish("local"),
                renderAndPublishToServer: publish("remote"),
            } });
            const { createProgram } = await import("./src/cli.ts");
            delete process.env.WENYAN_NO_AUTO_COVER;
            const markdown = "---\\ntitle: Test\\n---\\n\\nBody\\n";
            for (const route of ["local", "remote"]) {
                for (const disabled of [false, true]) {
                    const args = ["node", "wenyan", "publish", "--env-file", "/dev/null"];
                    if (route === "remote") args.push("--server", "https://example.invalid", "--api-key", "test-key");
                    if (disabled) args.push("--no-auto-cover");
                    args.push("--", markdown);
                    await createProgram().parseAsync(args);
                    const result = inputs.at(-1);
                    assert.equal(result.route, route);
                    assert.equal(Boolean(result.coverArtId), !disabled, route + ": auto cover");
                    if (disabled) assert.equal(result.content, markdown);
                    else assert.match(result.content, /^cover: https:/m);
                }
            }
            assert.equal(inputs.length, 4);
            `,
        ], { cwd: new URL("..", import.meta.url), stdio: "pipe" });
    });

    it("should have credential command", () => {
        const commands = program.commands.map((cmd) => cmd.name());
        assert.ok(commands.includes("credential"));
    });

    it("should display help when no command is provided", async () => {
        const args = ["node", "wenyan"];

        // 不应该抛出异常
        await program.parseAsync(args);
    });

    it("should parse theme list command", async () => {
        const consoleLogMock = mock.fn();
        mock.method(console, "log", consoleLogMock);

        const args = ["node", "wenyan", "theme", "--list"];

        await program.parseAsync(args);

        // 验证输出了主题列表
        const hasOutput = consoleLogMock.mock.calls.some((call) => {
            const args = call.arguments;
            return args.some((arg: any) => typeof arg === "string" && arg.includes("内置主题"));
        });
        assert.ok(hasOutput);
    });
});
