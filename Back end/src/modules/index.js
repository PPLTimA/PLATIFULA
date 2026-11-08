// Daftar semua modul fitur. Tiap modul mengekspor `register(router)`.
const modules = [
  require('../members/Ghefira Zahira Zulfa/PBI-01-accounts-authentication/backend/auth.routes'),
  require('../members/Ghefira Zahira Zulfa/PBI-01-accounts-authentication/backend/account.routes'),
  require('../members/Ghefira Zahira Zulfa/PBI-02-retailer-store-management/backend/routes'),
  require('../members/Firman Adinata/PBI-03-user-management/backend/routes'),
  require('../members/Firman Adinata/PBI-04-product-categories/backend/public.routes'),
  require('../members/Firman Adinata/PBI-04-product-categories/backend/admin.routes'),
  require('../members/Harjuno/PBI-05-retailer-verification/backend/verification.routes'),
  require('../members/Harjuno/PBI-05-retailer-verification/backend/admin-decisions.routes'),
  require('../members/Harjuno/PBI-06-in-app-notifications/backend/routes'),
  require('../members/Malika Khansa Tsabita/PBI-07-surplus-products/backend/routes'),
  require('../members/Malika Khansa Tsabita/PBI-08-product-templates/backend/routes'),
  require('../members/Zaskia Khansa Salviadi/PBI-09-catalog-map-favorites/backend/catalog.routes'),
  require('../members/Zaskia Khansa Salviadi/PBI-09-catalog-map-favorites/backend/map.routes'),
  require('../members/Zaskia Khansa Salviadi/PBI-09-catalog-map-favorites/backend/favorites.routes'),
  require('../members/Zaskia Khansa Salviadi/PBI-10-product-reports/backend/routes'),
  require('../members/Kenneth Nathaniel Tirtadjaja/PBI-11-customer-orders/backend/create.routes'),
  require('../members/Kenneth Nathaniel Tirtadjaja/PBI-11-customer-orders/backend/history.routes'),
  require('../members/Kenneth Nathaniel Tirtadjaja/PBI-12-retailer-orders-pickup/backend/list.routes'),
  require('../members/Kenneth Nathaniel Tirtadjaja/PBI-12-retailer-orders-pickup/backend/pickup.routes'),
  require('../members/Firman Adinata/PBI-20-no-show/backend/routes'),
  require('../members/Ghefira Zahira Zulfa/PBI-15-store-reviews/backend/public.routes'),
  require('../members/Ghefira Zahira Zulfa/PBI-15-store-reviews/backend/customer.routes'),
  require('../members/Malika Khansa Tsabita/PBI-16-report-moderation/backend/routes'),
  require('../members/Malika Khansa Tsabita/PBI-17-retailer-dashboard-reports/backend/routes'),
  require('../members/Harjuno/PBI-18-admin-statistics-export/backend/routes'),
  require('../members/Harjuno/PBI-19-platform-announcements/backend/routes'),
  require('../members/Zaskia Khansa Salviadi/PBI-21-product-filters/backend/routes'),
  require('../members/Zaskia Khansa Salviadi/PBI-22-education-articles/backend/public.routes'),
  require('../members/Zaskia Khansa Salviadi/PBI-22-education-articles/backend/admin.routes'),
  require('../members/Kenneth Nathaniel Tirtadjaja/PBI-14-platform-commission/backend/routes'),
  require('./products/compat.routes'),
  require('./orders/compat.routes'),
];

function registerModules(router) {
  modules.forEach((module) => module.register(router));
}

module.exports = { registerModules };
