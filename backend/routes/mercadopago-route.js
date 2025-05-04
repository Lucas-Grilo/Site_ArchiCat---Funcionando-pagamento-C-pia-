import express from 'express';
import mercadopago from 'mercadopago';
import dotenv from 'dotenv';

const router = express.Router();

// Rota para processar pagamentos PIX
router.post('/process-pix', async (req, res) => {
    try {
        console.log('Dados recebidos:', req.body);
        
        // Verificar se os dados necessários estão presentes
        if (!req.body.transaction_amount || !req.body.payer || !req.body.payer.identification) {
            return res.status(400).json({
                error: 'Dados incompletos',
                details: 'Verifique se todos os campos obrigatórios foram enviados'
            });
        }
        
        // Criar objeto de pagamento com os parâmetros corretos
        const paymentData = {
            transaction_amount: Number(req.body.transaction_amount),
            description: req.body.description || 'Produtos ArchiCat',
            payment_method_id: 'pix',
            payer: {
                email: req.body.payer.email,
                first_name: req.body.payer.first_name,
                last_name: req.body.payer.last_name,
                identification: {
                    type: req.body.payer.identification.type,
                    number: req.body.payer.identification.number
                }
            }
        };
        
        console.log('Enviando para Mercado Pago:', paymentData);
        
        const payment = await mercadopago.payment.create(paymentData);

        console.log('Resposta do Mercado Pago:', payment.body);
        
        if (!payment || !payment.body || !payment.body.point_of_interaction) {
            throw new Error('Erro ao gerar o PIX');
        }

        res.json({
            payment_id: payment.body.id,
            status: payment.body.status,
            qrCodeBase64: payment.body.point_of_interaction.transaction_data.qr_code_base64,
            pixCode: payment.body.point_of_interaction.transaction_data.qr_code,
            transactionAmount: payment.body.transaction_amount,
            dateOfExpiration: payment.body.date_of_expiration
        });
    } catch (error) {
        console.error('Erro detalhado:', error);
        console.error('Erro no processamento do PIX:', error);
        res.status(500).json({ 
            error: 'Erro ao processar o pagamento',
            details: error.message 
        });
    }
});

export default router;