document.getElementById("predictButton").addEventListener("click", async () => {

    const data = {};

    // Collect all input and select fields
    document.querySelectorAll("input[id], select[id]").forEach(element => {

        const id = element.id;

        // Checkbox fields
        if (element.type === "checkbox") {
            data[id] = element.checked;
        }

        // Number fields
        else if (element.type === "number") {
            data[id] = Number(element.value);
        }

        // Boolean select fields
        else if (
            element.value === "true" ||
            element.value === "false"
        ) {
            data[id] = element.value === "true";
        }

        // Text, date and select fields
        else {
            data[id] = element.value;
        }
    });

    console.log("Sending data:", data);

    try {


        console.log("FINAL DATA:", JSON.stringify(data, null, 2));
        const response = await fetch("/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        console.log("Response:", result);

        const resultSection = document.getElementById("result");

        resultSection.style.display = "block";

        if (!response.ok) {

            resultSection.innerHTML = `
                <h2>Prediction Error</h2>
                <p>${JSON.stringify(result.detail)}</p>
            `;

            return;
        }

        resultSection.innerHTML = `
            <h2>Prediction Result</h2>

            <h3>${result.prediction}</h3>

            <p>
                <strong>Functional:</strong>
                ${(result.probabilities.functional * 100).toFixed(2)}%
            </p>

            <p>
                <strong>Functional Needs Repair:</strong>
                ${(result.probabilities["functional needs repair"] * 100).toFixed(2)}%
            </p>

            <p>
                <strong>Non Functional:</strong>
                ${(result.probabilities.non_functional * 100).toFixed(2)}%
            </p>
        `;

    } catch (error) {

        console.error("Error:", error);

        document.getElementById("result").innerHTML = `
            <h2>Connection Error</h2>
            <p>Could not connect to the prediction API.</p>
        `;
    }

});