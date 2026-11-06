import Dexie, { type Table } from "dexie";
import { customers, transactions } from "@/data/data"; 

// 1. Define TypeScript interfaces for your data shapes
export interface Customer  {
    id: string;               // Manual UUID string (or auto-increment if you changed customers to ++id),
    name: string;
    phone: string | null;
    whatsapp: string | null;
    nickname: string | null;
    notes: string | null;
    status: string;
    createdAt: string;
  }

export interface Transaction  {
    id: string;
    customerId: string;
    type: string;
    amount: number;
    note: string | null;
    createdAt: string;
  }

// 2. Create a typed class extending Dexie
export class ShopDatabase extends Dexie {
  customers!: Table<Customer, string>;     // Primary key 'id' is a string
  transactions!: Table<Transaction, string>; // Primary key 'id' is a string

  constructor() {
    super("daftar");

    this.version(1).stores({
      // Match your index definitions with your mock data fields
      customers: "id, name, phone, status",
      transactions: "id, customerId, type, createdAt"
    });
  }
}

// 3. Export a single database instance
export const db = new ShopDatabase();

// 4. Fully typed seed function
export async function seedDatabase(): Promise<void> {
  const customerCount: number = await db.customers.count();
  
  if (customerCount === 0) {
    console.log('Database is empty. Seeding from mock files...');
    
    // Dexie's bulkAdd automatically validates against your Customer and Transaction types
    await db.customers.bulkAdd(customers);
    await db.transactions.bulkAdd(transactions);
    
    console.log('Seeding complete!');
  }
}export async function addCustomer(newCustomer: Customer) {
  await db.customers.add(newCustomer);
  return newCustomer;
}export async function getCustomerTransactions(customerId: string) {
  return await db.transactions
    .where('customerId')
    .equals(customerId)
    .toArray();
}


// 1. Fetch all customers AND calculate their total balances in one go
export async function getCustomersWithTotals() {
  // Get raw customer list from IndexedDB
  const customers = await db.customers.toArray();

  // Calculate totals for each customer in parallel
  const customersWithTotals = await Promise.all(
    customers.map(async (customer) => {
      // Find all transactions belonging to this specific customer
      const userTransactions = await db.transactions
        .where('customerId')
        .equals(customer.id)
        .toArray();

      // Compute balance: DEBT adds to balance (+), PAYMENT subtracts (-)
      let totalBalance = 0;
      for (const tx of userTransactions) {
        if (tx.type === 'DEBT') {
          totalBalance += tx.amount;
        } else if (tx.type === 'PAYMENT') {
          totalBalance -= tx.amount;
        }
      }

      return {
        ...customer,
        totalBalance, // Enriched object ready for UI
      };
    })
  );

  return customersWithTotals;
}

// 2. Add a new transaction for a customer
export async function addTransaction(transactionData: Transaction) {
  // Save to Dexie
  await db.transactions.add(transactionData);
  
  // Return the updated balance for this customer so the UI can update cleanly
  return await getCustomerNewBalance(transactionData.customerId);
}

// Helper to recalculate a single customer's balance
async function getCustomerNewBalance(customerId: string): Promise<number> {
  const userTransactions = await db.transactions
    .where('customerId')
    .equals(customerId)
    .toArray();

  let balance = 0;
  for (const tx of userTransactions) {
    if (tx.type === 'DEBT') balance += tx.amount;
    if (tx.type === 'PAYMENT') balance -= tx.amount;
  }
  return balance;
}
export async function getAllTransactions() {
  let tx= await db.transactions.toArray();
  let Receivable=0;
  let Payable=0;

  for (const t of tx) {
    if (t.type === 'DEBT') {
      Receivable += t.amount; // Customer owes money (+)
    } else if (t.type === 'PAYMENT') {
      Payable += t.amount; // Customer paid money / credit (-)
    }
  }
  return {Receivable, Payable};
}