import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Stack,
  Typography,
  Button,
  Card,
  CardContent,
  Container,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { FormProvider, FTextField } from "../components/form";
import { useAuth } from "../contexts/useAuth";

// Validation Schema
const SignUpSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phonenumber: Yup.string().required("Phone number is required"),
  address: Yup.string().required("Address is required"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Please confirm your password"),
});

// Default Values
const defaultValues = {
  username: "",
  email: "",
  phonenumber: "",
  address: "",
  password: "",
  confirmPassword: "",
};

function SignUpPage() {
  const navigate = useNavigate();
  const auth = useAuth();

  const methods = useForm({
    resolver: yupResolver(SignUpSchema),
    defaultValues,
  });

  const { handleSubmit } = methods;

  const onSubmit = async (data) => {
    const { username, password, email, phonenumber, address } = data;

    auth.signup({ username, password, email, phonenumber, address }, () => {
      console.log("Signup successful. Redirecting to login...");
      navigate("/login");
    });
  };

  return (
    <Container maxWidth="sm" sx={{ py: 5 }}>
      <Card>
        <CardContent>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              <Typography variant="h4" textAlign="center">
                Sign Up
              </Typography>

              <FTextField name="username" label="Username" />
              <FTextField name="email" label="Email" />
              <FTextField name="phonenumber" label="Phone Number" />
              <FTextField name="address" label="Address" />
              <FTextField name="password" label="Password" type="password" />
              <FTextField name="confirmPassword" label="Confirm Password" type="password" />

              <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                Create Account
              </Button>
            </Stack>
          </FormProvider>
        </CardContent>
      </Card>
    </Container>
  );
}

export default SignUpPage;
