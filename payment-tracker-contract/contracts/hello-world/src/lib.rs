#![no_std]
use soroban_sdk::{contract, contractevent, contractimpl, contracttype, Address, Env, String};

#[derive(Clone)]
#[contracttype]
pub struct Payment {
    pub sender: Address,
    pub recipient: Address,
    pub amount: i128,
    pub status: String,
}

#[contractevent]
pub struct PaymentCreated {
    #[topic]
    pub payment_id: u64,
    pub sender: Address,
    pub recipient: Address,
    pub amount: i128,
}

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {

    pub fn set_logger(env: Env, logger_contract_id: Address) {
    env.storage().instance().set(&"logger", &logger_contract_id);
}

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
            recipient: recipient.clone(),
            amount,
            status: String::from_str(&env, "pending"),
        };

        env.storage().instance().set(&payment_id, &payment);

        PaymentCreated {
            payment_id,
            sender,
            recipient,
            amount,
        }
        .publish(&env);

        let logger_contract_id: Address = env
            .storage()
            .instance()
            .get(&"logger")
            .expect("logger contract not configured");

        let _: u64 = env.invoke_contract(
            &logger_contract_id,
            &soroban_sdk::Symbol::new(&env, "log_payment"),
            soroban_sdk::vec![&env],
        );
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