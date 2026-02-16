"use server";

export async function getExchangeRate() {
    try {
        const response = await fetch("https://www.banguat.gob.gt/variables/ws/TipoCambio.asmx", {
            method: "POST",
            headers: {
                "Content-Type": "text/xml; charset=utf-8",
                "SOAPAction": "http://www.banguat.gob.gt/variables/ws/TipoCambioDia"
            },
            body: `<?xml version="1.0" encoding="utf-8"?>
            <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
              <soap:Body>
                <TipoCambioDia xmlns="http://www.banguat.gob.gt/variables/ws/" />
              </soap:Body>
            </soap:Envelope>`,
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        const text = await response.text();

        // Simple Regex Parsing to avoid dependencies
        // Look for <referencia> and <fecha> inside <VarDolar> or similar structure
        // The structure usually is <CambioDolar><VarDolar><referencia>7.75</referencia>...

        const referenciaMatch = text.match(/<referencia>([\d.]+)<\/referencia>/);
        const rate = referenciaMatch ? parseFloat(referenciaMatch[1]) : null;

        if (!rate) {
            throw new Error("Could not parse rate from Banguat response");
        }

        // Banguat usually gives a single reference rate aka "mid market" or just one official rate.
        // Banks have buy/sell spread around this.
        // The previous library might have simulated buy/sell or Banguat exposes it differently.
        // Checking Banguat docs, TypeCambioDia returns <referencia>.
        // Let's assume Buy/Sell are slightly adjusted or just use reference for both if that's what we have.
        // Or we can return just the reference.
        // Looking at typical GT implementation, often `referencia` is used.
        // If the previous lib returned buy/sell specifically, it might have been scrapping or using a different func.
        // But `TipoCambioDia` is the standard.
        // Let's check if the user code expects buyRate/sellRate specifically.
        // The previous interface had `buyRate` and `sellRate`.
        // Inspecting the previous output: `current.buyRate`, `current.sellRate`.
        // If Banguat only gives one, we can map both to it or add a standard spread.
        // Let's map both to reference for now to ensure compatibility.

        return {
            buyRate: rate,
            sellRate: rate, // Banguat provides a reference rate
            date: new Date().toISOString(),
            success: true
        };
    } catch (error) {
        console.error("Error fetching exchange rate from Banguat:", error);
        // Fallback or error
        return {
            success: false,
            error: "Failed to fetch exchange rate"
        };
    }
}
