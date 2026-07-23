// Generated from packages/contracts/openapi/openapi.json. Do not edit by hand.
export const openApiOperations = {
  acceptInvitation: {
    method: 'POST',
    operationId: 'acceptInvitation',
    path: '/v1/organizations/{organizationId}/invitations/accept',
  },
  activateProduct: {
    method: 'POST',
    operationId: 'activateProduct',
    path: '/v1/organizations/{organizationId}/products/{productId}/activate',
  },
  addProductBarcode: {
    method: 'POST',
    operationId: 'addProductBarcode',
    path: '/v1/organizations/{organizationId}/products/{productId}/barcodes',
  },
  addSaleItem: {
    method: 'POST',
    operationId: 'addSaleItem',
    path: '/v1/organizations/{organizationId}/sales/{saleId}/items',
  },
  approveSalesRefund: {
    method: 'POST',
    operationId: 'approveSalesRefund',
    path: '/v1/organizations/{organizationId}/sales/{saleId}/refunds/{refundId}/approve',
  },
  archiveBranch: {
    method: 'DELETE',
    operationId: 'archiveBranch',
    path: '/v1/organizations/{organizationId}/branches/{branchId}',
  },
  archiveOrganization: {
    method: 'DELETE',
    operationId: 'archiveOrganization',
    path: '/v1/organizations/{organizationId}',
  },
  archiveProduct: {
    method: 'POST',
    operationId: 'archiveProduct',
    path: '/v1/organizations/{organizationId}/products/{productId}/archive',
  },
  cancelSale: {
    method: 'POST',
    operationId: 'cancelSale',
    path: '/v1/organizations/{organizationId}/sales/{saleId}/cancel',
  },
  closeCashSession: {
    method: 'POST',
    operationId: 'closeCashSession',
    path: '/v1/organizations/{organizationId}/cash/sessions/{sessionId}/close',
  },
  completeCashShiftHandoff: {
    method: 'POST',
    operationId: 'completeCashShiftHandoff',
    path: '/v1/organizations/{organizationId}/cash/handoffs/{handoffId}/complete',
  },
  completeEmailVerification: {
    method: 'POST',
    operationId: 'completeEmailVerification',
    path: '/v1/auth/email-verification/complete',
  },
  completeInventoryTransfer: {
    method: 'POST',
    operationId: 'completeInventoryTransfer',
    path: '/v1/organizations/{organizationId}/inventory/transfers/{transferId}/complete',
  },
  completeOnboarding: {
    method: 'POST',
    operationId: 'completeOnboarding',
    path: '/v1/organizations/{organizationId}/onboarding/complete',
  },
  completePasswordReset: {
    method: 'POST',
    operationId: 'completePasswordReset',
    path: '/v1/auth/password-reset/complete',
  },
  completeProductMediaUpload: {
    method: 'POST',
    operationId: 'completeProductMediaUpload',
    path: '/v1/organizations/{organizationId}/products/{productId}/media/complete',
  },
  completeProfileAvatar: {
    method: 'POST',
    operationId: 'completeProfileAvatar',
    path: '/v1/profile/avatar/complete',
  },
  completeSale: {
    method: 'POST',
    operationId: 'completeSale',
    path: '/v1/organizations/{organizationId}/sales/{saleId}/complete',
  },
  consumePosDeviceEnrollment: {
    method: 'POST',
    operationId: 'consumePosDeviceEnrollment',
    path: '/v1/organizations/{organizationId}/device-enrollments/consume',
  },
  countCash: {
    method: 'POST',
    operationId: 'countCash',
    path: '/v1/organizations/{organizationId}/cash/sessions/{sessionId}/counts',
  },
  countCashShiftHandoff: {
    method: 'POST',
    operationId: 'countCashShiftHandoff',
    path: '/v1/organizations/{organizationId}/cash/handoffs/{handoffId}/count',
  },
  createBranch: {
    method: 'POST',
    operationId: 'createBranch',
    path: '/v1/organizations/{organizationId}/branches',
  },
  createCashDrawer: {
    method: 'POST',
    operationId: 'createCashDrawer',
    path: '/v1/organizations/{organizationId}/cash/drawers',
  },
  createCashRegister: {
    method: 'POST',
    operationId: 'createCashRegister',
    path: '/v1/organizations/{organizationId}/cash/registers',
  },
  createInventoryLocation: {
    method: 'POST',
    operationId: 'createInventoryLocation',
    path: '/v1/organizations/{organizationId}/inventory/locations',
  },
  createInventoryReservation: {
    method: 'POST',
    operationId: 'createInventoryReservation',
    path: '/v1/organizations/{organizationId}/inventory/reservations',
  },
  createInventoryTransfer: {
    method: 'POST',
    operationId: 'createInventoryTransfer',
    path: '/v1/organizations/{organizationId}/inventory/transfers',
  },
  createInvitation: {
    method: 'POST',
    operationId: 'createInvitation',
    path: '/v1/organizations/{organizationId}/invitations',
  },
  createMembership: {
    method: 'POST',
    operationId: 'createMembership',
    path: '/v1/organizations/{organizationId}/memberships',
  },
  createOrganization: {
    method: 'POST',
    operationId: 'createOrganization',
    path: '/v1/organizations',
  },
  createPosDeviceEnrollment: {
    method: 'POST',
    operationId: 'createPosDeviceEnrollment',
    path: '/v1/organizations/{organizationId}/device-enrollments',
  },
  createProduct: {
    method: 'POST',
    operationId: 'createProduct',
    path: '/v1/organizations/{organizationId}/products',
  },
  createProductCategory: {
    method: 'POST',
    operationId: 'createProductCategory',
    path: '/v1/organizations/{organizationId}/product-categories',
  },
  createProductVariant: {
    method: 'POST',
    operationId: 'createProductVariant',
    path: '/v1/organizations/{organizationId}/products/{productId}/variants',
  },
  createSale: {
    method: 'POST',
    operationId: 'createSale',
    path: '/v1/organizations/{organizationId}/sales',
  },
  decideCashApproval: {
    method: 'POST',
    operationId: 'decideCashApproval',
    path: '/v1/organizations/{organizationId}/cash/approvals/{approvalId}/decision',
  },
  decideCashShiftHandoff: {
    method: 'POST',
    operationId: 'decideCashShiftHandoff',
    path: '/v1/organizations/{organizationId}/cash/handoffs/{handoffId}/decision',
  },
  evaluatePermission: {
    method: 'POST',
    operationId: 'evaluatePermission',
    path: '/v1/organizations/{organizationId}/authorization/evaluate',
  },
  generateSaleReceipt: {
    method: 'POST',
    operationId: 'generateSaleReceipt',
    path: '/v1/organizations/{organizationId}/sales/{saleId}/receipt',
  },
  getActiveCashSession: {
    method: 'GET',
    operationId: 'getActiveCashSession',
    path: '/v1/organizations/{organizationId}/cash/sessions/active',
  },
  getAnalyticsOverview: {
    method: 'GET',
    operationId: 'getAnalyticsOverview',
    path: '/v1/organizations/{organizationId}/analytics/overview',
  },
  getAuthorizationContext: {
    method: 'GET',
    operationId: 'getAuthorizationContext',
    path: '/v1/organizations/{organizationId}/authorization/context',
  },
  getCashIntegrationOperationalStatus: {
    method: 'GET',
    operationId: 'getCashIntegrationOperationalStatus',
    path: '/v1/organizations/{organizationId}/cash/integrations/status',
  },
  getCashOperationalSummary: {
    method: 'GET',
    operationId: 'getCashOperationalSummary',
    path: '/v1/organizations/{organizationId}/cash/sessions/{sessionId}/summary',
  },
  getCashPolicy: {
    method: 'GET',
    operationId: 'getCashPolicy',
    path: '/v1/organizations/{organizationId}/cash/policies',
  },
  getCashSession: {
    method: 'GET',
    operationId: 'getCashSession',
    path: '/v1/organizations/{organizationId}/cash/sessions/{sessionId}',
  },
  getCashShiftHandoff: {
    method: 'GET',
    operationId: 'getCashShiftHandoff',
    path: '/v1/organizations/{organizationId}/cash/handoffs/{handoffId}',
  },
  getCashTimeline: {
    method: 'GET',
    operationId: 'getCashTimeline',
    path: '/v1/organizations/{organizationId}/cash/sessions/{sessionId}/timeline',
  },
  getCurrentIdentity: { method: 'GET', operationId: 'getCurrentIdentity', path: '/v1/identity' },
  getCurrentPosDevice: {
    method: 'GET',
    operationId: 'getCurrentPosDevice',
    path: '/v1/organizations/{organizationId}/devices/current',
  },
  getIdentityFoundation: {
    method: 'GET',
    operationId: 'getIdentityFoundation',
    path: '/v1/users/{userId}/identity',
  },
  getInventoryAvailability: {
    method: 'GET',
    operationId: 'getInventoryAvailability',
    path: '/v1/organizations/{organizationId}/inventory/availability',
  },
  getInventoryTimeline: {
    method: 'GET',
    operationId: 'getInventoryTimeline',
    path: '/v1/organizations/{organizationId}/inventory/movements',
  },
  getLiveness: { method: 'GET', operationId: 'getLiveness', path: '/health/live' },
  getOnboarding: {
    method: 'GET',
    operationId: 'getOnboarding',
    path: '/v1/organizations/{organizationId}/onboarding',
  },
  getOrganization: {
    method: 'GET',
    operationId: 'getOrganization',
    path: '/v1/organizations/{organizationId}',
  },
  getPaymentAttemptOutcome: {
    method: 'GET',
    operationId: 'getPaymentAttemptOutcome',
    path: '/v1/organizations/{organizationId}/sales/{saleId}/payments/{paymentAttemptId}/outcome',
  },
  getPaymentAttemptOutcomeByIdempotencyKey: {
    method: 'GET',
    operationId: 'getPaymentAttemptOutcomeByIdempotencyKey',
    path: '/v1/organizations/{organizationId}/sales/{saleId}/payment-outcome',
  },
  getProduct: {
    method: 'GET',
    operationId: 'getProduct',
    path: '/v1/organizations/{organizationId}/products/{productId}',
  },
  getProductMedia: {
    method: 'GET',
    operationId: 'getProductMedia',
    path: '/v1/organizations/{organizationId}/products/{productId}/media/{mediaId}',
  },
  getProfileAvatar: {
    method: 'GET',
    operationId: 'getProfileAvatar',
    path: '/v1/profile/avatar/{token}',
  },
  getReadiness: { method: 'GET', operationId: 'getReadiness', path: '/health/ready' },
  getSale: {
    method: 'GET',
    operationId: 'getSale',
    path: '/v1/organizations/{organizationId}/sales/{saleId}',
  },
  getSaleAdministrationDetail: {
    method: 'GET',
    operationId: 'getSaleAdministrationDetail',
    path: '/v1/organizations/{organizationId}/sales-administration/{saleId}/detail',
  },
  getSaleAdministrationTimeline: {
    method: 'GET',
    operationId: 'getSaleAdministrationTimeline',
    path: '/v1/organizations/{organizationId}/sales-administration/{saleId}/timeline',
  },
  getSaleDiagnosticBundle: {
    method: 'GET',
    operationId: 'getSaleDiagnosticBundle',
    path: '/v1/organizations/{organizationId}/sales-administration/{saleId}/diagnostic',
  },
  getSalesOperationalExceptions: {
    method: 'GET',
    operationId: 'getSalesOperationalExceptions',
    path: '/v1/organizations/{organizationId}/sales-administration/exceptions',
  },
  getSalesOverview: {
    method: 'GET',
    operationId: 'getSalesOverview',
    path: '/v1/organizations/{organizationId}/sales-administration/overview',
  },
  getSalesPolicy: {
    method: 'GET',
    operationId: 'getSalesPolicy',
    path: '/v1/organizations/{organizationId}/sales/policies',
  },
  getUser: { method: 'GET', operationId: 'getUser', path: '/v1/users/{userId}' },
  heartbeatPosDevice: {
    method: 'POST',
    operationId: 'heartbeatPosDevice',
    path: '/v1/organizations/{organizationId}/devices/current/heartbeat',
  },
  initiateCashShiftHandoff: {
    method: 'POST',
    operationId: 'initiateCashShiftHandoff',
    path: '/v1/organizations/{organizationId}/cash/sessions/{sessionId}/handoffs',
  },
  listActiveOrganizations: {
    method: 'GET',
    operationId: 'listActiveOrganizations',
    path: '/v1/organizations',
  },
  listBranches: {
    method: 'GET',
    operationId: 'listBranches',
    path: '/v1/organizations/{organizationId}/branches',
  },
  listBusinessTemplates: {
    method: 'GET',
    operationId: 'listBusinessTemplates',
    path: '/v1/business-templates',
  },
  listCashApprovals: {
    method: 'GET',
    operationId: 'listCashApprovals',
    path: '/v1/organizations/{organizationId}/cash/approvals',
  },
  listCashDrawers: {
    method: 'GET',
    operationId: 'listCashDrawers',
    path: '/v1/organizations/{organizationId}/cash/drawers',
  },
  listCashIntegrationQuarantine: {
    method: 'GET',
    operationId: 'listCashIntegrationQuarantine',
    path: '/v1/organizations/{organizationId}/cash/integrations/quarantine',
  },
  listCashRegisters: {
    method: 'GET',
    operationId: 'listCashRegisters',
    path: '/v1/organizations/{organizationId}/cash/registers',
  },
  listExternalMappings: {
    method: 'GET',
    operationId: 'listExternalMappings',
    path: '/v1/organizations/{organizationId}/external-mappings',
  },
  listFeatureFlags: {
    method: 'GET',
    operationId: 'listFeatureFlags',
    path: '/v1/organizations/{organizationId}/feature-flags',
  },
  listInventoryLocations: {
    method: 'GET',
    operationId: 'listInventoryLocations',
    path: '/v1/organizations/{organizationId}/inventory/locations',
  },
  listInvitations: {
    method: 'GET',
    operationId: 'listInvitations',
    path: '/v1/organizations/{organizationId}/invitations',
  },
  listMemberships: {
    method: 'GET',
    operationId: 'listMemberships',
    path: '/v1/organizations/{organizationId}/memberships',
  },
  listPermissions: {
    method: 'GET',
    operationId: 'listPermissions',
    path: '/v1/organizations/{organizationId}/permissions',
  },
  listPosDevices: {
    method: 'GET',
    operationId: 'listPosDevices',
    path: '/v1/organizations/{organizationId}/devices',
  },
  listProductCategories: {
    method: 'GET',
    operationId: 'listProductCategories',
    path: '/v1/organizations/{organizationId}/product-categories',
  },
  listProducts: {
    method: 'GET',
    operationId: 'listProducts',
    path: '/v1/organizations/{organizationId}/products',
  },
  listRoles: {
    method: 'GET',
    operationId: 'listRoles',
    path: '/v1/organizations/{organizationId}/roles',
  },
  listSales: {
    method: 'GET',
    operationId: 'listSales',
    path: '/v1/organizations/{organizationId}/sales',
  },
  listSalesReceiptsAdministration: {
    method: 'GET',
    operationId: 'listSalesReceiptsAdministration',
    path: '/v1/organizations/{organizationId}/sales-administration/receipts',
  },
  listSalesRefundsAdministration: {
    method: 'GET',
    operationId: 'listSalesRefundsAdministration',
    path: '/v1/organizations/{organizationId}/sales-administration/refunds',
  },
  listSessions: { method: 'GET', operationId: 'listSessions', path: '/v1/sessions' },
  listUserEmails: {
    method: 'GET',
    operationId: 'listUserEmails',
    path: '/v1/users/{userId}/emails',
  },
  login: { method: 'POST', operationId: 'login', path: '/v1/auth/login' },
  logout: { method: 'POST', operationId: 'logout', path: '/v1/auth/logout' },
  logoutAll: { method: 'POST', operationId: 'logoutAll', path: '/v1/auth/logout-all' },
  openCashSession: {
    method: 'POST',
    operationId: 'openCashSession',
    path: '/v1/organizations/{organizationId}/cash/sessions/open',
  },
  prepareCashDeposit: {
    method: 'POST',
    operationId: 'prepareCashDeposit',
    path: '/v1/organizations/{organizationId}/cash/sessions/{sessionId}/deposits',
  },
  prepareProductMediaUpload: {
    method: 'POST',
    operationId: 'prepareProductMediaUpload',
    path: '/v1/organizations/{organizationId}/products/{productId}/media/uploads',
  },
  prepareProfileAvatar: {
    method: 'POST',
    operationId: 'prepareProfileAvatar',
    path: '/v1/profile/avatar/uploads',
  },
  prepareSaleCheckout: {
    method: 'POST',
    operationId: 'prepareSaleCheckout',
    path: '/v1/organizations/{organizationId}/sales/{saleId}/checkout',
  },
  reconcileCashSession: {
    method: 'POST',
    operationId: 'reconcileCashSession',
    path: '/v1/organizations/{organizationId}/cash/sessions/{sessionId}/reconcile',
  },
  recordCashMovement: {
    method: 'POST',
    operationId: 'recordCashMovement',
    path: '/v1/organizations/{organizationId}/cash/sessions/{sessionId}/movements',
  },
  recordInventoryCount: {
    method: 'POST',
    operationId: 'recordInventoryCount',
    path: '/v1/organizations/{organizationId}/inventory/counts',
  },
  recordInventoryMovement: {
    method: 'POST',
    operationId: 'recordInventoryMovement',
    path: '/v1/organizations/{organizationId}/inventory/movements',
  },
  recordSalePayment: {
    method: 'POST',
    operationId: 'recordSalePayment',
    path: '/v1/organizations/{organizationId}/sales/{saleId}/payments',
  },
  refreshSession: { method: 'POST', operationId: 'refreshSession', path: '/v1/auth/refresh' },
  releaseInventoryReservation: {
    method: 'POST',
    operationId: 'releaseInventoryReservation',
    path: '/v1/organizations/{organizationId}/inventory/reservations/{reservationId}/release',
  },
  removeProfileAvatar: {
    method: 'DELETE',
    operationId: 'removeProfileAvatar',
    path: '/v1/profile/avatar',
  },
  reopenCashSession: {
    method: 'POST',
    operationId: 'reopenCashSession',
    path: '/v1/organizations/{organizationId}/cash/sessions/{sessionId}/reopen',
  },
  requestCashApproval: {
    method: 'POST',
    operationId: 'requestCashApproval',
    path: '/v1/organizations/{organizationId}/cash/approvals',
  },
  requestEmailVerification: {
    method: 'POST',
    operationId: 'requestEmailVerification',
    path: '/v1/auth/email-verification/request',
  },
  requestPasswordReset: {
    method: 'POST',
    operationId: 'requestPasswordReset',
    path: '/v1/auth/password-reset/request',
  },
  requestSaleRefund: {
    method: 'POST',
    operationId: 'requestSaleRefund',
    path: '/v1/organizations/{organizationId}/sales/{saleId}/refunds',
  },
  resendInvitation: {
    method: 'POST',
    operationId: 'resendInvitation',
    path: '/v1/organizations/{organizationId}/invitations/{invitationId}/resend',
  },
  restartOnboarding: {
    method: 'POST',
    operationId: 'restartOnboarding',
    path: '/v1/organizations/{organizationId}/onboarding/restart',
  },
  restoreBranch: {
    method: 'POST',
    operationId: 'restoreBranch',
    path: '/v1/organizations/{organizationId}/branches/{branchId}/restore',
  },
  restoreProduct: {
    method: 'POST',
    operationId: 'restoreProduct',
    path: '/v1/organizations/{organizationId}/products/{productId}/restore',
  },
  resumeCashSession: {
    method: 'POST',
    operationId: 'resumeCashSession',
    path: '/v1/organizations/{organizationId}/cash/sessions/{sessionId}/resume',
  },
  resumeSale: {
    method: 'POST',
    operationId: 'resumeSale',
    path: '/v1/organizations/{organizationId}/sales/{saleId}/resume',
  },
  revokeInvitation: {
    method: 'DELETE',
    operationId: 'revokeInvitation',
    path: '/v1/organizations/{organizationId}/invitations/{invitationId}',
  },
  revokePosDevice: {
    method: 'POST',
    operationId: 'revokePosDevice',
    path: '/v1/organizations/{organizationId}/devices/{deviceId}/revoke',
  },
  revokeSession: {
    method: 'DELETE',
    operationId: 'revokeSession',
    path: '/v1/sessions/{sessionId}',
  },
  rotatePosDeviceCredential: {
    method: 'POST',
    operationId: 'rotatePosDeviceCredential',
    path: '/v1/organizations/{organizationId}/devices/{deviceId}/rotate-credential',
  },
  saveCashPolicy: {
    method: 'POST',
    operationId: 'saveCashPolicy',
    path: '/v1/organizations/{organizationId}/cash/policies',
  },
  saveOnboarding: {
    method: 'PUT',
    operationId: 'saveOnboarding',
    path: '/v1/organizations/{organizationId}/onboarding',
  },
  searchSalesAdministration: {
    method: 'GET',
    operationId: 'searchSalesAdministration',
    path: '/v1/organizations/{organizationId}/sales-administration/history',
  },
  setInventoryPolicy: {
    method: 'PUT',
    operationId: 'setInventoryPolicy',
    path: '/v1/organizations/{organizationId}/inventory/policies',
  },
  setPosDeviceStatus: {
    method: 'PATCH',
    operationId: 'setPosDeviceStatus',
    path: '/v1/organizations/{organizationId}/devices/{deviceId}/status',
  },
  suspendCashSession: {
    method: 'POST',
    operationId: 'suspendCashSession',
    path: '/v1/organizations/{organizationId}/cash/sessions/{sessionId}/suspend',
  },
  suspendSale: {
    method: 'POST',
    operationId: 'suspendSale',
    path: '/v1/organizations/{organizationId}/sales/{saleId}/suspend',
  },
  transferCash: {
    method: 'POST',
    operationId: 'transferCash',
    path: '/v1/organizations/{organizationId}/cash/transfers',
  },
  transitionCashDeposit: {
    method: 'POST',
    operationId: 'transitionCashDeposit',
    path: '/v1/organizations/{organizationId}/cash/deposits/{depositId}/transition',
  },
  updateBranch: {
    method: 'PATCH',
    operationId: 'updateBranch',
    path: '/v1/organizations/{organizationId}/branches/{branchId}',
  },
  updateCashDrawer: {
    method: 'PATCH',
    operationId: 'updateCashDrawer',
    path: '/v1/organizations/{organizationId}/cash/drawers/{drawerId}',
  },
  updateCashRegister: {
    method: 'PATCH',
    operationId: 'updateCashRegister',
    path: '/v1/organizations/{organizationId}/cash/registers/{registerId}',
  },
  updateCurrentProfile: {
    method: 'PATCH',
    operationId: 'updateCurrentProfile',
    path: '/v1/profile',
  },
  updateFeatureFlag: {
    method: 'PATCH',
    operationId: 'updateFeatureFlag',
    path: '/v1/organizations/{organizationId}/features/{featureKey}',
  },
  updateInventoryLocation: {
    method: 'PUT',
    operationId: 'updateInventoryLocation',
    path: '/v1/organizations/{organizationId}/inventory/locations/{locationId}',
  },
  updateMembership: {
    method: 'PATCH',
    operationId: 'updateMembership',
    path: '/v1/organizations/{organizationId}/memberships/{membershipId}',
  },
  updateOrganization: {
    method: 'PATCH',
    operationId: 'updateOrganization',
    path: '/v1/organizations/{organizationId}',
  },
  updateProduct: {
    method: 'PATCH',
    operationId: 'updateProduct',
    path: '/v1/organizations/{organizationId}/products/{productId}',
  },
  updateProductPrice: {
    method: 'POST',
    operationId: 'updateProductPrice',
    path: '/v1/organizations/{organizationId}/products/{productId}/prices',
  },
  updateSalesPolicy: {
    method: 'PUT',
    operationId: 'updateSalesPolicy',
    path: '/v1/organizations/{organizationId}/sales/policies',
  },
} as const;
