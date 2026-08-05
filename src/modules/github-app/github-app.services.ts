
export async function handleGithubWebHook(event: string | undefined, payload: any) {
    console.log("event :",  event);
    console.log("payload :", payload);
}