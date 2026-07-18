#![no_std]
use soroban_sdk::{contract, contractevent, contractimpl, contracttype, Address, Env, String, IntoVal};

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    pub fn log_payment(env: Env) -> u64 {
        let count: u64 = env.storage().instance().get(&"count").unwrap_or(0);
        let new_count = count + 1;
        env.storage().instance().set(&"count", &new_count);
        new_count
    }

    pub fn get_count(env: Env) -> u64 {
        env.storage().instance().get(&"count").unwrap_or(0)
    }
}
stellar contract invoke --id CBI6IF57SL5KFDG4VUZRBFLER6PCQZA3LAKFOAITWSI5HFXV3KM6YT3M --source deployer --network testnet -- create_payment --payment_id 777 --sender deployer --recipient deployer --amount 10