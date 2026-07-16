#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String};

#[derive(Clone)]
#[contracttype]
pub struct Payment {
    pub sender: Address,
    pub recipient: Address,
    pub amount: i128,
    pub status: String,
}

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    pub fn create_payment(
        env: Env,
        payment_id: u64,
        sender: Address,
        recipient: Address,
        amount: i128,
    ) {
        sender.require_auth();

        let payment = Payment {
            sender: sender.clone(),
            recipient,
            amount,
            status: String::from_str(&env, "pending"),
        };

        env.storage().instance().set(&payment_id, &payment);
    }

    pub fn complete_payment(env: Env, payment_id: u64) {
        let mut payment: Payment = env
            .storage()
            .instance()
            .get(&payment_id)
            .expect("payment not found");

        payment.status = String::from_str(&env, "completed");

        env.storage().instance().set(&payment_id, &payment);
    }

    pub fn get_payment(env: Env, payment_id: u64) -> Payment {
        env.storage()
            .instance()
            .get(&payment_id)
            .expect("payment not found")
    }
}

mod test;