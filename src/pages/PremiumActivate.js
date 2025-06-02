import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

const PremiumActivate = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { userInfo, updateProfile } = useAuth();
  
  const [isActivating, setIsActivating] = useState(true);
  const [activationSuccess, setActivationSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // Extraer parámetros de la URL
  const buyOrder = searchParams.get('order');
  const amount = searchParams.get('amount');
  const authCode = searchParams.get('auth');

  useEffect(() => {
    if (buyOrder && amount && authCode && userInfo) {
      activatePremium();
    } else {
      setError('Información de pago incompleta');
      setIsActivating(false);
    }
  }, [buyOrder, amount, authCode, userInfo]);

  const activatePremium = async () => {
    try {
      setIsActivating(true);
      setError(null);

      console.log('🔄 Activando premium con datos:', {
        buy_order: buyOrder,
        amount: parseInt(amount),
        authorization_code: authCode
      });

      // Obtener el token del usuario
      const token = userInfo?.token;
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      // Llamar al backend de Express para activar premium
      const response = await fetch('/api/users/premium', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_premium: 2 // Activar premium
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al activar premium');
      }

      if (data.success) {
        console.log('✅ Premium activado exitosamente:', data);
        
        // Actualizar la información del usuario en el contexto
        if (updateProfile && data.user) {
          try {
            await updateProfile({
              id_premium: data.user.id_premium,
              is_premium: data.user.is_premium
            });
            console.log('✅ Perfil de usuario actualizado en el contexto');
          } catch (updateError) {
            console.warn('⚠️ Error al actualizar perfil en contexto:', updateError);
          }
        }
        
        setActivationSuccess(true);
        setIsActivating(false);
        
        // Mostrar mensaje de éxito y redirigir después de 3 segundos
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        throw new Error(data.message || 'Error al activar premium');
      }
    } catch (error) {
      console.error('❌ Error al activar premium:', error);
      setError(error.message || 'Error al activar premium');
      setIsActivating(false);
    }
  };

  if (isActivating) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.iconContainer}>
            💎
          </div>
          <div style={styles.loader}>⏳</div>
          <h2 style={styles.loadingTitle}>Activando Premium...</h2>
          <p style={styles.loadingSubtitle}>
            Estamos procesando tu pago y activando tu cuenta Premium
          </p>
          
          {buyOrder && (
            <div style={styles.paymentInfo}>
              <h3 style={styles.paymentInfoTitle}>Información del Pago:</h3>
              <p style={styles.paymentInfoText}>Orden: {buyOrder}</p>
              <p style={styles.paymentInfoText}>Monto: ${parseInt(amount || '0').toLocaleString()} CLP</p>
              <p style={styles.paymentInfoText}>Autorización: {authCode}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activationSuccess) {
    return (
      <div style={styles.container}>
        <div style={styles.successContainer}>
          <div style={styles.successIconContainer}>
            ✅
          </div>
          
          <h1 style={styles.successTitle}>¡Premium Activado! 🎉</h1>
          <p style={styles.successSubtitle}>
            ¡Felicitaciones! Tu cuenta Premium ha sido activada exitosamente.
          </p>
          
          <div style={styles.benefitsContainer}>
            <h3 style={styles.benefitsTitle}>Funcionalidades Premium Activadas:</h3>
            
            <div style={styles.benefitItem}>
              <span>✅</span>
              <span style={styles.benefitText}>Registro ilimitado de ganado</span>
            </div>
            
            <div style={styles.benefitItem}>
              <span>✅</span>
              <span style={styles.benefitText}>Reportes avanzados y estadísticas</span>
            </div>
            
            <div style={styles.benefitItem}>
              <span>✅</span>
              <span style={styles.benefitText}>Exportación de datos a Excel/PDF</span>
            </div>
            
            <div style={styles.benefitItem}>
              <span>✅</span>
              <span style={styles.benefitText}>Soporte prioritario 24/7</span>
            </div>
            
            <div style={styles.benefitItem}>
              <span>✅</span>
              <span style={styles.benefitText}>Sincronización en la nube</span>
            </div>
          </div>
          
          <button
            style={styles.continueButton}
            onClick={() => navigate('/')}
          >
            Continuar a CowTracker
          </button>
          
          <p style={styles.redirectMessage}>
            Serás redirigido automáticamente en unos segundos...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div style={styles.container}>
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>⚠️</div>
        <h2 style={styles.errorTitle}>Error de Activación</h2>
        <p style={styles.errorMessage}>
          {error || 'No se pudo activar tu cuenta Premium'}
        </p>
        
        <div style={styles.buttonContainer}>
          <button
            style={styles.retryButton}
            onClick={() => activatePremium()}
          >
            Reintentar
          </button>
          
          <button
            style={styles.homeButton}
            onClick={() => navigate('/')}
          >
            Ir al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  loadingContainer: {
    textAlign: 'center',
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    maxWidth: '500px',
    width: '100%'
  },
  iconContainer: {
    fontSize: '60px',
    marginBottom: '20px'
  },
  loader: {
    fontSize: '30px',
    marginBottom: '20px'
  },
  loadingTitle: {
    color: '#2c3e50',
    marginBottom: '10px'
  },
  loadingSubtitle: {
    color: '#7f8c8d',
    marginBottom: '30px',
    lineHeight: '1.5'
  },
  paymentInfo: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'left'
  },
  paymentInfoTitle: {
    color: '#2c3e50',
    marginBottom: '10px'
  },
  paymentInfoText: {
    color: '#7f8c8d',
    margin: '5px 0'
  },
  successContainer: {
    textAlign: 'center',
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    maxWidth: '600px',
    width: '100%'
  },
  successIconContainer: {
    fontSize: '80px',
    marginBottom: '20px'
  },
  successTitle: {
    color: '#27ae60',
    marginBottom: '10px'
  },
  successSubtitle: {
    color: '#7f8c8d',
    marginBottom: '30px',
    lineHeight: '1.5'
  },
  benefitsContainer: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '15px',
    marginBottom: '30px'
  },
  benefitsTitle: {
    color: '#2c3e50',
    marginBottom: '15px'
  },
  benefitItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
    gap: '10px'
  },
  benefitText: {
    color: '#34495e'
  },
  continueButton: {
    backgroundColor: '#27ae60',
    color: 'white',
    padding: '15px 30px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '20px'
  },
  redirectMessage: {
    color: '#7f8c8d',
    fontSize: '14px'
  },
  errorContainer: {
    textAlign: 'center',
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    maxWidth: '500px',
    width: '100%'
  },
  errorIcon: {
    fontSize: '60px',
    marginBottom: '20px'
  },
  errorTitle: {
    color: '#e74c3c',
    marginBottom: '10px'
  },
  errorMessage: {
    color: '#7f8c8d',
    marginBottom: '30px',
    lineHeight: '1.5'
  },
  buttonContainer: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  retryButton: {
    backgroundColor: '#3498db',
    color: 'white',
    padding: '15px 30px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  homeButton: {
    backgroundColor: '#95a5a6',
    color: 'white',
    padding: '15px 30px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
};

export default PremiumActivate; 