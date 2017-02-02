export interface ICodeExecutor {
    execute(code: string): Promise<void>
}