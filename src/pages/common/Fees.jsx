import { useEffect, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Table from "../../components/ui/Table.jsx";
import PaymentHistory from "../../components/feature/PaymentHistory.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Input from "../../components/ui/Input.jsx";
import { useAuth } from "../../hooks/useAuth.jsx";
import axios from "axios";

const FeesPage = () => {
  const [fees, setFees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const token = localStorage.getItem('smsAccessToken');

  const [paymentForm, setPaymentForm] = useState({
    email: "",
    amount: "",
    term: "",
    session:""
  });

  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuth();
  const apiBaseUrl = "http://localhost:5000/api";

  // Always use smsAccessToken
  const getAuthConfig = () => {
    const token = localStorage.getItem("smsAccessToken");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // Load fees + payment history
  const loadData = async () => {
    try {
      setError("");

      const authConfig = getAuthConfig();

      const [feesRes, paymentsRes] = await Promise.all([
        axios.get(`${apiBaseUrl}/parent/fees`, authConfig),
        axios.get(`${apiBaseUrl}/parent/payments/history`, authConfig),
      ]);

      setFees(feesRes.data.data || []);
      console.log(fees);
      
      setPayments(paymentsRes.data.data || []);
      return feesRes;
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load fees.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {

    loadData();
  }, []);
// Verifying paystack payment
const verifyPayment = async (fee) => {
  try {
    const response = await fetch(`${apiBaseUrl}/payments/verify/${fee.reference}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Verification failed:", errorData);
      return;
    }

    const data = await response.json();
    console.log("Verification result:", data);

  } catch (error) {
    console.error("Frontend Fetch error:", error);
  }
};


  
  // Open modal
  const openPaymentModal = async (fee) => {
    setSelectedFee("1st Term");
    
    setPaymentForm({
      email: user?.email || "",
      amount: fee?.totalDue || "20000",
    });
    setPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    if (submitting) return;
    setPaymentModalOpen(false);
    setSelectedFee(null);
  };

  // Submit payment to Paystack
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
  
    setPaymentError("");
    setPaymentSuccess("");
  
    if (!selectedFee) {
      setPaymentError("No fee selected.");
      return;
    }
  
    if (!paymentForm.email.trim()) {
      setPaymentError("Email is required.");
      return;
    }
  
    const amount = Number(paymentForm.amount);
    if (!amount || amount <= 0) {
      setPaymentError("Enter a valid amount.");
      return;
    }
  
    if (!paymentForm.term.trim()) {
      setPaymentError("Term is required.");
      return;
    }
  
    if (!paymentForm.session.trim()) {
      setPaymentError("Session is required.");
      return;
    }
  
    setSubmitting(true);
  
    try {
      const payload = {
        amount: paymentForm.amount,
        email: paymentForm.email,
        session: paymentForm.session,
        term: paymentForm.term,
        callbackUrl: `${window.location.origin}/fees`,
      };
  
      const res = await axios.post(
        `${apiBaseUrl}/payments/initialize`,
        payload,
        getAuthConfig()
      );
  
      const authUrl = res.data?.authorization_url;
      console.log(authUrl);
      
      if (!authUrl) {
        setPaymentError("Failed to get payment link.");
        setSubmitting(false);
        return;
      }
  
      setPaymentSuccess("Redirecting to Paystack...");
      window.location.href = authUrl;
  
    } catch (err) {
      setPaymentError(err.response?.data?.message || "Payment initialization failed.");
      setSubmitting(false);
    }
  };
  

  // Table columns
  const columns = [
    {
      Header: "Student",
      accessor: "student",
      Cell: (row) => row.student?.fullName || "—",
    },
    { Header: "Term", accessor: "term" },
    { Header: "Session", accessor: "session" },
    {
      Header: "Amount",
      accessor: "totalDue",
      Cell: (row) => `₦${Number(row.amount).toLocaleString()}`,
    },
    { Header: "Status", accessor: "status" },
    {
      Header: "Action",
      accessor: "actions",
      Cell: (row) => (
        <Button onClick={() => verifyPayment(row)}>
          Verify Payment
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Button onClick={() => openPaymentModal()}>
          Pay with Paystack
        </Button>
      <Card title="Pending Fees">
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        {loading ? (
          <p>Loading fees...</p>
        ) : (
          <Table columns={columns} data={fees} />
        )}
      </Card>

      <Card title="Payment History">
        <PaymentHistory payments={payments} />
      </Card>

      {/* PAYMENT MODAL */}
      <Modal
        open={paymentModalOpen}
        title="Pay School Fees"
        onClose={closePaymentModal}
        placement="bottom-right"
      >
        {selectedFee ? (
          <form className="space-y-4" onSubmit={handlePaymentSubmit}>
            <div className="p-4 bg-gray-50 rounded-xl text-sm">
              <p className="font-bold">{selectedFee.student?.fullName}</p>
              <p>Term: {selectedFee.term}</p>
              <p>Session: {selectedFee.session}</p>
              <p>
                Outstanding:{" "}
                <strong>₦{Number(selectedFee.totalDue).toLocaleString()}</strong>
              </p>
            </div>

            <Input
              label="Parent Email"
              type="email"
              value={paymentForm.email}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, email: e.target.value })
              }
            />
            <Input
              label="Term"
              type="term"
              value={paymentForm.term}
              placeholder={"1st Term, 2nd Term, 3rd Term"}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, term: e.target.value })
              }
            />
            <Input
              label="Session"
              type="session"
              value={paymentForm.session}
              placeholder={"2025/2026"}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, session: e.target.value })
              }
            />

            <Input
              label="Amount to Pay"
              type="number"
              value={paymentForm.amount}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, amount: e.target.value })
              }
            />

            {paymentError && (
              <p className="text-red-600 text-sm">{paymentError}</p>)}

            <Button disabled={submitting} className="w-full">
              {submitting ? "Processing..." : "Pay with Paystack"}
            </Button>
          </form>
        ) : (
          <p>Select a fee to begin payment.</p>
        )}
      </Modal>
    </div>
  );
};

export default FeesPage;
