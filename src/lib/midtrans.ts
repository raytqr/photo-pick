// Midtrans Helper Library - Using Snap API

const midtransClient = require('midtrans-client');

const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true';
const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || '';
const CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY || '';

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
 */
export function calculateTotalWithFee(amount: number): { base: number, fee: number, total: number } {
    const total = Math.ceil(amount / (1 - QRIS_MDR_PERCENT));
    const fee = total - amount;

    return {
        base: amount,
        fee: fee,
        total: total
    };
}

/**
 * Create Snap transaction and return redirect URL
 * Uses Snap API instead of Core API for better compatibility
 */
export async function createSnapTransaction(params: ChargeParams) {
    if (!SERVER_KEY) {
        throw new Error("Midtrans Server Key is missing");
    }

    const snap = new midtransClient.Snap({
        isProduction: IS_PRODUCTION,
        serverKey: SERVER_KEY,
        clientKey: CLIENT_KEY
    });

    const parameter = {
        transaction_details: {
            order_id: params.orderId,
            gross_amount: params.amount
        },
        item_details: [{
            id: 'REF-' + params.orderId,
            price: params.amount,
            quantity: 1,
            name: params.itemName.substring(0, 50) // Max 50 chars
        }],
        customer_details: {
            first_name: params.firstName || 'Customer',
            last_name: params.lastName || '',
            email: params.email || '',
            phone: params.phone || ''
        },
        // Enable only QRIS-compatible payment methods
        enabled_payments: ['gopay', 'shopeepay', 'other_qris'],
        callbacks: {
            finish: 'https://satsetpic.com/dashboard?payment=success'
        }
    };

    try {
        const transaction = await snap.createTransaction(parameter);
        return {
            token: transaction.token,
            redirect_url: transaction.redirect_url,
            status_code: '201'
        };
    } catch (error: any) {
        console.error("Snap Error:", error);
        return {
            status_code: '500',
            status_message: error.message || 'Failed to create Snap transaction'
        };
    }
}

/**
 * Check transaction status
 */
export async function checkTransactionStatus(orderId: string) {
    if (!SERVER_KEY) {
        throw new Error("Midtrans Server Key is missing");
    }

    const core = new midtransClient.CoreApi({
        isProduction: IS_PRODUCTION,
        serverKey: SERVER_KEY,
        clientKey: CLIENT_KEY
    });

    try {
        const response = await core.transaction.status(orderId);
        return response;
    } catch (error: any) {
        return {
            transaction_status: 'unknown',
            status_message: error.message
        };
    }
}
