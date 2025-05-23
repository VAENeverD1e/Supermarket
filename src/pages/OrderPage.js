import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Alert, Container, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import apiService from "../app/apiService";
import { useAuth } from "../contexts/useAuth";

function OrderPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const customerResponse = await apiService.get(`/api/customers/by-user/${user.id}`);
        const customerId = customerResponse.data?.customerid;

        if (!customerId) {
          setError("Customer information not found");
          return;
        }

        const ordersResponse = await apiService.get(`/api/customers/${customerId}/orders`);
        const allOrders = ordersResponse.data || [];

        const unpaidOrders = allOrders.filter((order) => order.status.toLowerCase() !== "paid");
        setOrders(unpaidOrders);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.id]);

  const handlePayAll = async () => {
    if (!user?.id || orders.length === 0) return;
  
    try {
      const customerResponse = await apiService.get(`/api/customers/by-user/${user.id}`);
      const customerId = customerResponse.data.customerid;
  
      const orderIds = orders.map((order) => order.orderid);
  
      await apiService.post(`/api/customers/${customerId}/invoices`, {
        orderids: orderIds,
      });
  
      alert("Invoice created successfully!");
      
      // Optionally, refetch orders to update the UI
      const ordersResponse = await apiService.get(`/api/customers/${customerId}/orders`);
      const updatedOrders = ordersResponse.data || [];
      const unpaidOrders = updatedOrders.filter((order) => order.status.toLowerCase() !== "paid");
      setOrders(unpaidOrders);
  
      navigate("/profile");
    } catch (err) {
      console.error("Failed to create invoice:", err);
      alert("Failed to create invoice.");
    }
  };
  

  return (
    <Container sx={{ py: 5, minHeight: "100vh" }}>
      <Button variant="contained" sx={{ mb: 3 }} onClick={() => navigate("/")}>
        Back to Homepage
      </Button>

      <Typography variant="h4" gutterBottom>
        My Orders
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Box>
          {orders.length === 0 ? (
            <Typography>No unpaid orders found.</Typography>
          ) : (
            <Box>
              {orders.map((order) => (
                <Box
                  key={order.orderid}
                  sx={{
                    mb: 2,
                    p: 2,
                    border: "1px solid #ccc",
                    borderRadius: 2,
                    boxShadow: 1,
                  }}
                >
                  <Typography><strong>Order ID:</strong> {order.orderid}</Typography>
                  <Typography><strong>Status:</strong> {order.status}</Typography>
                  <Typography><strong>Address:</strong> {order.address}</Typography>
                  <Typography><strong>Product ID:</strong> {order.productid}</Typography>
                  <Typography><strong>Payment Method:</strong> {order.paymentmethod}</Typography>
                  <Typography><strong>Order Date:</strong> {new Date(order.orderdate).toLocaleDateString()}</Typography>
                </Box>
              ))}

              <Button
                variant="contained"
                color="success"
                sx={{ mt: 4 }}
                onClick={handlePayAll}
              >
                Pay All
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
}

export default OrderPage;
