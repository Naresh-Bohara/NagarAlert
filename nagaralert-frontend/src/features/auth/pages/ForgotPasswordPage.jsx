import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, Send } from "lucide-react";
import toast from "react-hot-toast";

import { useForgotPasswordMutation } from "../../../store/api/authApi";
import { ROUTES } from "../../../utils/constants/routes";

import Button from "../../../components/atoms/Button/Button";
import Input from "../../../components/atoms/Input/Input";
import Card from "../../../components/atoms/Card/Card";
import AuthLayout from "../../../components/templates/AuthLayout/AuthLayout";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const fade = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, type: "spring", stiffness: 120 },
    }),
  };

  const validateEmail = (value) => {
    if (!value.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return "Enter a valid email.";
    return "";
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setError(validateEmail(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateEmail(email);
    if (validation) return setError(validation);

    try {
      const response = await forgotPassword({ email }).unwrap();
      const token =
        response?.data?.resetToken || response?.resetToken || "temp-token";

      toast.success("Reset instructions sent to your email!");

      setTimeout(() => {
        navigate(ROUTES.RESET_PASSWORD.replace(":token", token), {
          state: { email },
        });
      }, 1500);
    } catch (err) {
      const msg =
        err?.data?.errors?.[0]?.msg ||
        err?.data?.message ||
        "Failed to send reset email.";

      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your email to receive reset instructions"
      backLink={ROUTES.LOGIN}
      backText="Back to login"
    >
      <motion.div
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <Card className="p-8">
          <motion.div variants={fade} custom={0}>
            <h2 className="text-2xl font-bold text-gray-900 text-center">
              Forgot Password?
            </h2>
            <p className="text-gray-600 text-center mt-1 mb-6">
              We’ll send you a one-time verification code.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={fade} custom={1}>
              <Input
                label="Email"
                name="email"
                type="email"
                value={email}
                onChange={handleChange}
                placeholder="you@example.com"
                error={error}
                icon={<Mail className="w-5 h-5" />}
                disabled={isLoading}
                required
              />
            </motion.div>

            <motion.div variants={fade} custom={2}>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isLoading}
                disabled={isLoading}
              >
                Send Reset Instructions
                <Send className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </form>
        </Card>

        <motion.div variants={fade} custom={3} className="mt-6">
          <Card className="p-4 flex space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                Security Notice
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                OTP expires in 15 minutes. Never share your OTP with anyone.
              </p>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fade} custom={4} className="text-center mt-4">
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to login
          </Link>
        </motion.div>
      </motion.div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
