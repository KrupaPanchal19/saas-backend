const express = require("express");
const dashboard_admin = express.Router();

//middleware
const userAuth = require("../../middleware/passport/user_auth");
const companyAdminStaffAuth = require("../../middleware/company_auth/admin_staff_auth");

//controller
const {
  deliveryCountDashboard,
  dashboardUpcoming,
  dashboardPriceGraph,
  calenderData,
  dashboradMessageList,
} = require("../../controller/admin/dashboard_admin.controller");

dashboard_admin.get(
  "/admin/dashboard/count",
  userAuth,
  companyAdminStaffAuth,
  deliveryCountDashboard
);

dashboard_admin.get(
  "/admin/dashboard/upcoming",
  userAuth,
  companyAdminStaffAuth,
  dashboardUpcoming
);

dashboard_admin.get(
  "/admin/dashboard/graph",
  userAuth,
  companyAdminStaffAuth,
  dashboardPriceGraph
);

dashboard_admin.get(
  "/admin/calender",
  userAuth,
  companyAdminStaffAuth,
  calenderData
);

dashboard_admin.get(
  "/admin/dashboard/messages",
  userAuth,
  companyAdminStaffAuth,
  dashboradMessageList
);

module.exports = dashboard_admin;
