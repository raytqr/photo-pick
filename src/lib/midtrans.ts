// Midtrans Helper Library

const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true';
const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || '';
const BASE_URL = IS_PRODUCTION
    ? 'https://api.midtrans.com/v2'
    : 'https://api.sandbox.midtrans.com/v2';

// 0.7% MDR for Retail/Shopping (QRIS)
const QRIS_MDR_PERCENT = 0.007;

export interface ChargeParams {
    orderId: string;
    amount: number;
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    itemName: string;
}

/**
 * Calculate the total price including QRIS fee (0.7%)
 * Formula: Total = Amount / (1 - MDR)
 * Example: 10000 / (1 - 0.007) = 10070.49 -> 10071
 */
export function calculateTotalWithFee(amount: number): { base: number, fee: number, total: number } {
    // We want the merchant to receive the full 'amount'.
    // So the customer pays 'total' such that 'total' * (1 - 0.7%) = 'amount' is INCORRECT if we just want to ADD the fee.
    // User requested "biaya ditanggung client".
    // If we simply add fee: Total = Amount + (Amount * 0.7%) = Amount * 1.007
    //   Then user pays Amount * 1.007.
    //   Midtrans deducts 0.7% of Total.
    //   Net received = Total * (1 - 0.007) = Amount * 1.007 * 0.993 = Amount * 0.999951 (Approx Amount).
    // This is the standard way to pass fee to customer.

    // Exact calculation to ensure net received is AT LEAST amount:
    // Net = Total * (1 - MDR) >= Amount
    // Total >= Amount / (1 - MDR)

    // Using simple addition (User's request "plus biaya potongan"):
    // Usually customers prefer simple addition, but for exact settlement, division is better.
    // Let's use the division formula to be safe for the merchant.

    // Formula: Total = Math.ceil(Amount / (1 - QRIS_MDR_PERCENT));

    const total = Math.ceil(amount / (1 - QRIS_MDR_PERCENT));
    const fee = total - amount;

    return {
        base: amount,
        fee: fee,
        total: total
    };
}

export async function createQrisTransaction(params: ChargeParams) {
    if (!SERVER_KEY) {
        throw new Error("Midtrans Server Key is missing");
    }

    const authString = Buffer.from(SERVER_KEY + ':').toString('base64');

    const payload = {
        payment_type: 'qris',
        transaction_details: {
            order_id: params.orderId,
            gross_amount: params.amount // Must be the TOTAL amount
        },
        item_details: [{
            id: 'REF-' + params.orderId,
            price: params.amount,
            quantity: 1,
            name: params.itemName
        }],
        customer_details: {
            first_name: params.firstName || 'Customer',
            last_name: params.lastName || '',
            email: params.email || '',
            phone: params.phone || ''
        },
        qris: {
            // Acquirer options can be configured here if needed, default is fine
        }
    };

    const response = await fetch(`${BASE_URL}/charge`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Basic ${authString}`
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();
    return data;
}

export async function checkTransactionStatus(orderId: string) {
    if (!SERVER_KEY) {
        throw new Error("Midtrans Server Key is missing");
    }

    const authString = Buffer.from(SERVER_KEY + ':').toString('base64');

    const response = await fetch(`${BASE_URL}/${orderId}/status`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Basic ${authString}`
        }
    });

    return await response.json();
}
