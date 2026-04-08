import { useEffect, useRef, useState } from "react";
import { WebR } from "webr";

export default function RRunner() {
    const [output, setOutput] = useState("not run yet");
    const [count, setCount] = useState(0);

    async function runR() {
        const webR = new WebR();
        await webR.init();

        await webR.evalR(`
            x <- c(1, 2, 3, 4, 5)
            cat("Hello")
            `);

        const messages = await webR.flush();
        console.log(messages);
        const text = messages.map((msg) => {
            return msg;
        }).join("");

        setOutput(text);
        setCount(count + 1);
    }

    return (
        <div>
            <button onClick={runR}>
                Run R {count}
            </button>
            <p>
                {output}
            </p>
        </div>
    );
}