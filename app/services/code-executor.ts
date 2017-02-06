export interface ICodeExecutor {
    execute(code: string): Promise<void>
    abort(): void
    createScreenshot(preview: boolean): string
}