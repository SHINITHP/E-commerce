const easyinvoice = require('easyinvoice');
const fs = require('fs');
const path = require('path');
const order = require('../../models/order.js'); // Adjust the path to your order model

const downloadInvoice = async (req, res) => {
    try {
        const orderId = req.query.id;
        const orders = await order.findById(orderId)
            .populate('addressID')
            .populate('productID')
            .exec();

        const invoiceData = {
            currency: 'INR',
            marginTop: 25,
            marginRight: 25,
            marginLeft: 25,
            marginBottom: 25,
            sender: {
                company: 'Ashion',
                address: '123 Main Street',
                city: 'New York',
                state: 'NY',
                postalCode: '10001',
                country: 'USA',
                phone: '+1-234-567-8901',
                email: 'info@ashion.com',
                website: 'www.ashion.com',
                logo: path.join(__dirname, 'public', 'img', 'logo.png') // Adjust the path if necessary
            },
            client: {
                company: `${orders.addressId.firstname} ${orders.addressId.lastname}`,
                email: orders.addressId.email,
                phoneNumber: orders.addressId.phonenumber,
                address: `${orders.addressId.address}, ${orders.addressId.city}, ${orders.addressId.state}, ${orders.addressId.pincode}`
            },
            invoiceNumber: 'INV-123',
            invoiceDate: new Date().toDateString(),
            products: orders.products.map(order => ({
                description: order.productId.name,
                quantity: order.quantity,
                size: order.size,
                color: order.color,
                price: order.productPrice
            })),
            PaidAmount: orders.amount,
            bottomNotice: 'Amount received'
        };

        const deliveryCharge = 50; // Define the delivery charge or get it from orders if applicable
        invoiceData.products.forEach(product => {
            product.price += deliveryCharge;
        });

        easyinvoice.createInvoice(invoiceData, async function (result) {
            const filePath = path.join(__dirname, 'public', 'invoice.pdf');
            fs.writeFileSync(filePath, result.pdf, 'base64');

            res.download(filePath, 'invoice.pdf', (err) => {
                if (err) {
                    console.error('Error downloading file:', err);
                } else {
                    fs.unlinkSync(filePath);
                }
            });
        });
    } catch (err) {
        console.error('Error fetching orders or generating invoice:', err);
        res.status(500).send('Error fetching orders or generating invoice');
    }
};

module.exports = downloadInvoice;
