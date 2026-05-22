export * from './types';
export { supabase, isSupabaseConfigured, activeStoreId } from './client';
export { authService } from './auth';
export { productService } from './products';
export { categoryService } from './categories';
export { transactionService } from './transactions';

import { authService } from './auth';
import { productService } from './products';
import { categoryService } from './categories';
import { transactionService } from './transactions';

export const dbService = {
  getProducts:         productService.getProducts.bind(productService),
  addProduct:          productService.addProduct.bind(productService),
  updateProduct:       productService.updateProduct.bind(productService),
  updateProductStock:  productService.updateProductStock.bind(productService),
  deleteProduct:       productService.deleteProduct.bind(productService),

  getCategories:       categoryService.getCategories.bind(categoryService),
  addCategory:         categoryService.addCategory.bind(categoryService),
  updateCategory:      categoryService.updateCategory.bind(categoryService),
  deleteCategory:      categoryService.deleteCategory.bind(categoryService),

  getTransactions:    transactionService.getTransactions.bind(transactionService),
  createTransaction:  transactionService.createTransaction.bind(transactionService),

  getOrCreateStore:    authService.getOrCreateStore.bind(authService),
  getStoreById:        authService.getStoreById.bind(authService),
  updateStoreAvatar:   authService.updateStoreAvatar.bind(authService),
  signIn:              authService.signIn.bind(authService),
  getCurrentSession:   authService.getCurrentSession.bind(authService),
  signOut:             authService.signOut.bind(authService),
  getCashiers:         authService.getCashiers.bind(authService),
  resetPassword:       authService.resetPassword.bind(authService),
  updatePassword:      authService.updatePassword.bind(authService),
};
