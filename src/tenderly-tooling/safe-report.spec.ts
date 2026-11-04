import { describe, expect, it } from "vitest";
import { sanitizeMarkdown } from "./safe-report";

describe("sanitizeMarkdown", () => {
  it("should keep batch text on one line without html or code spans", () => {
    expect(
      sanitizeMarkdown("all good\n\n<!-- hidden\n`code`\t<b>bold</b>"),
    ).toBe("all good &lt;!-- hidden 'code' &lt;b&gt;bold&lt;/b&gt;");
  });
});
