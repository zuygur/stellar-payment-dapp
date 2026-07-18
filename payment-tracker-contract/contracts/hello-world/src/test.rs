#![cfg(test)]

use super::*;
use soroban_sdk::{contract, contractimpl, testutils::Address as _, Env};

#[contract]
pub struct MockLogger;

#[contractimpl]
impl MockLogger {
    pub fn log_payment(env: Env) -> u64 {
        let count: u64 = env.storage().instance().get(&"count").unwrap_or(0);
        let new_count = count + 1;
        env.storage().instance().set(&"count", &new_count);
        new_count
    }
}

fn setup(env: &Env) -> ContractClient {
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(env, &contract_id);

    let logger_id = env.register(MockLogger, ());
    client.set_logger(&logger_id);

    client
}

#[test]
fn test_create_payment_stores_pending_status() {
    let env = Env::default();
    env.mock_all_auths();

    let client = setup(&env);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    client.create_payment(&1u64, &sender, &recipient, &100i128);

    let payment = client.get_payment(&1u64);

    assert_eq!(payment.sender, sender);
    assert_eq!(payment.recipient, recipient);
    assert_eq!(payment.amount, 100);
    assert_eq!(payment.status, String::from_str(&env, "pending"));
}

#[test]
fn test_complete_payment_updates_status() {
    let env = Env::default();
    env.mock_all_auths();

    let client = setup(&env);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    client.create_payment(&2u64, &sender, &recipient, &50i128);
    client.complete_payment(&2u64);

    let payment = client.get_payment(&2u64);

    assert_eq!(payment.status, String::from_str(&env, "completed"));
}

#[test]
#[should_panic(expected = "payment not found")]
fn test_get_payment_fails_for_unknown_id() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    client.get_payment(&999u64);
}