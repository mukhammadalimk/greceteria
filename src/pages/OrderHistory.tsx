import OrdersTable from "../components/orders/OrdersTable";
import DashboardNav from "../components/dashboard/DashboardNav";
import FilterOptions from "../components/UI/FilterOptions";
import { useContext, useEffect, useLayoutEffect } from "react";
import LoginFirst from "../components/LoginFirst";
import { UserContext } from "../store/UserContext";
import { OrderActionKind, OrderContext } from "../store/OrderContext";
import { getAllOrders, getMyOrders } from "../api/orders";
import { orderPriceOptions, orderSortOptions } from "../data/helperData";
import useToggleOptions from "../hooks/useToggleOptions";

const OrderHistory = () => {
  const {
    state: { user },
  } = useContext(UserContext);
  const {
    state: { orders, loading, customOrders, filterQuery, sortQuery, error },
    dispatch,
    filterOrders,
    sortOrders,
  } = useContext(OrderContext);
  // This function opens the requested filter and closed other remaining open filters.
  const { filtersOpen, toggleOptionsHandler } = useToggleOptions(2);

  useLayoutEffect(() => {
    if (user) dispatch({ type: OrderActionKind.GET_ORDERS_START });
  }, [dispatch, user]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // For user
      if (user.role === "user") await getMyOrders(dispatch, "sort=-createdAt");
      // For admin
      else await getAllOrders(dispatch, "sort=-createdAt");
    })();
  }, [dispatch, user]);

  if (user === null) return <LoginFirst />;

  return (
    <div className="section-sm">
      <div className="container">
        <div className="order-history-page dashboard">
          <DashboardNav activeNavItem="Order History" />

          <div className="dashboard__main">
            <div className="filter__top">
              <FilterOptions
                options={orderPriceOptions}
                title="Select Price"
                onToggle={toggleOptionsHandler.bind(null, 0)}
                onSelect={(id: string) => filterOrders(id)}
                open={filtersOpen[0]}
                query={filterQuery}
                clearOption
              />
              <FilterOptions
                options={orderSortOptions}
                title="Sort By: Status"
                onToggle={toggleOptionsHandler.bind(null, 1)}
                onSelect={(id: string) => sortOrders(id)}
                open={filtersOpen[1]}
                query={sortQuery}
                clearOption
              />
            </div>

            <OrdersTable
              orders={filterQuery || sortQuery ? customOrders : orders}
              filterQuery={filterQuery}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
