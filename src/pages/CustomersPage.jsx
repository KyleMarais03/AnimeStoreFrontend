import React, { useEffect, useState } from "react";

function CustomersPage() {
    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8080/customer/getAll")
            .then((response) => response.json())
            .then((data) => setCustomers(data))
            .catch((error) => console.error("Error fetching customers:", error));
    }, []);

    return (
        <div>
            <h2 className="mb-4">Customers</h2>
            <div className="table-responsive">
                <table className="table table-striped table-bordered">
                    <thead className="table-light">
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Contact</th>
                    </tr>
                    </thead>
                    <tbody>
                    {customers.length > 0 ? (
                        customers.map((customer) => (
                            <tr key={customer.customerId}>
                                <td>
                                    {customer.firstName} {customer.lastName}
                                </td>
                                <td>{customer.email}</td>
                                <td>{customer.phoneNumber}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" className="text-center">
                                No customers found
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default CustomersPage;
