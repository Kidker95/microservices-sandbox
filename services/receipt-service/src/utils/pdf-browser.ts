import { Browser, chromium } from "playwright";

class PdfBrowser {

    private browser: Browser | null = null;
    private launching: Promise<Browser> | null = null;

    public async getBrowser(): Promise<Browser> {
        if (this.browser) return this.browser;

        if (!this.launching) {
            this.launching = chromium.launch().then(browser => {
                this.browser = browser;
                this.launching = null;
                return browser;
            });
        }

        return this.launching;
    }

    public async close(): Promise<void> {
        if (!this.browser) return;
        await this.browser.close();
        this.browser = null;
    }
}

export const pdfBrowser = new PdfBrowser();
