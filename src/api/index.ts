export * from './types';
export { supabase, isSupabaseConfigured, activeStoreId } from './client';
export { authService } from './auth';
export { productService } from './products';
export { categoryService } from './categories';
export { customerService } from './customers';
export { transactionService } from './transactions';

import { authService } from './auth';
import { productService } from './products';
import { categoryService } from './categories';
import { customerService } from './customers';
import { transactionService } from './transactions';

export const dbService = {
  // Products
  getProducts:         productService.getProducts.bind(productService),
  addProduct:          productService.addProduct.bind(productService),
  updateProduct:       productService.updateProduct.bind(productService),
  updateProductStock:  productService.updateProductStock.bind(productService),
  deleteProduct:       productService.deleteProduct.bind(productService),

  // Categories
  getCategories:       categoryService.getCategories.bind(categoryService),
  addCategory:         categoryService.addCategory.bind(categoryService),
  updateCategory:      categoryService.updateCategory.bind(categoryService),
  deleteCategory:      categoryService.deleteCategory.bind(categoryService),

  // Customers
  getCustomers:              customerService.getCustomers.bind(customerService),
  addCustomer:               customerService.addCustomer.bind(customerService),
  syncCustomerStatsAfterSale: customerService.syncCustomerStatsAfterSale.bind(customerService),

  // Transactions
  getTransactions:    transactionService.getTransactions.bind(transactionService),
  createTransaction:  transactionService.createTransaction.bind(transactionService),

  // Auth (proxied for backward compat)
  getOrCreateStore:    authService.getOrCreateStore.bind(authService),
  getStoreById:        authService.getStoreById.bind(authService),
  updateStoreAvatar:   authService.updateStoreAvatar.bind(authService),
  signUpAdmin:         authService.signUpAdmin.bind(authService),
  signIn:              authService.signIn.bind(authService),
  createCashier:       authService.createCashier.bind(authService),
  getCurrentSession:   authService.getCurrentSession.bind(authService),
  signOut:             authService.signOut.bind(authService),
  getCashiers:         authService.getCashiers.bind(authService),
  signInCashier:       authService.signInCashier.bind(authService),
  resetPassword:       authService.resetPassword.bind(authService),
  updatePassword:      authService.updatePassword.bind(authService),
};
