import crypto from 'crypto';

/* Para obtener el monto del BCV (pruebas) */
interface BcvResponse {
  code: string;
  fechavalor: string;
  tipocambio: number;
}

/* Para generar el codigo OTP */
interface OtpRequest {
  banco: string;
  monto: string;
  telefono: string;
  cedula: string;
}

interface OtpResponse {
  code: string;
  message: string;
  success?: boolean;
}

/* Para realizar el debito inmediato */
interface DebitoRequest {
  banco: string;
  monto: string;
  telefono: string;
  cedula: string;
  nombre: string;
  otp: string;
  concepto: string;
}

interface DebitoResponse {
  code: string;
  message: string;
  reference?: string;
  id?: string;
  success?: boolean;
}

/* Para consultar el estado de una operación */
interface ConsultaOpRequest {
  id: string;
}

interface ConsultaOpResponse {
  code: string;
  message?: string;
  reference?: string;
  success?: boolean;
}

export const getTasaBCV = async (): Promise<BcvResponse | null> => {
  const endpoint = '/MBbcv';
  const url = `${process.env.R4_API_URL}${endpoint}`;
  
  const moneda = 'USD';
  const today = new Date();
  const fechaValor = today.toISOString().split('T')[0]; 

  const dataToSign = `${fechaValor}${moneda}`;
  const secretKey = process.env.R4_COMMERCE_TOKEN || '';

  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(dataToSign)
    .digest('hex');

  const payload = {
    Moneda: moneda,
    Fechavalor: fechaValor
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': signature,
        'Commerce': secretKey
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data: BcvResponse = await response.json();
    return data;

  } catch (error) {
    console.error("Error consultando R4 BCV:", error);
    throw error;
  }
};

export const generateOtp = async (params: OtpRequest): Promise<OtpResponse> => {
  const endpoint = '/GenerarOtp';
  const url = `${process.env.R4_API_URL}${endpoint}`;
  const dataToSign = `${params.banco}${params.monto}${params.telefono}${params.cedula}`;
  const secretKey = process.env.R4_COMMERCE_TOKEN || '';

  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(dataToSign)
    .digest('hex');
  
  const payload = {
    "Banco": params.banco,
    "Monto": params.monto,
    "Telefono": params.telefono,
    "Cedula": params.cedula
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': signature,
        'Commerce': secretKey
      },
      body: JSON.stringify(payload)
    });

    const data: OtpResponse = await response.json();
    return data;

  } catch (error) {
    console.error("Error generando OTP:", error);
    throw error;
  }
};

export const processDebitoInmediato = async (params: DebitoRequest): Promise<DebitoResponse> => {
  const endpoint = '/DebitoInmediato';
  const url = `${process.env.R4_API_URL}${endpoint}`;
  const dataToSign = `${params.banco}${params.cedula}${params.telefono}${params.monto}${params.otp}`;
  const secretKey = process.env.R4_COMMERCE_TOKEN || '';

  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(dataToSign)
    .digest('hex');

  const payload = {
    "Banco": params.banco,
    "Monto": params.monto,
    "Telefono": params.telefono,
    "Cedula": params.cedula,
    "Nombre": params.nombre,
    "OTP": params.otp,
    "Concepto": params.concepto
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': signature,
        'Commerce': secretKey
      },
      body: JSON.stringify(payload)
    });
    console.log("Respuesta: ", response)

    const data: DebitoResponse = await response.json();
    return data;

  } catch (error) {
    console.error("Error procesando Débito Inmediato R4:", error);
    throw error;
  }
};

export const checkOperationStatus = async (params: ConsultaOpRequest): Promise<ConsultaOpResponse> => {
  const endpoint = '/ConsultarOperaciones';
  const url = `${process.env.R4_API_URL}${endpoint}`;
  
  const dataToSign = params.id;
  const secretKey = process.env.R4_COMMERCE_TOKEN || '';

  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(dataToSign)
    .digest('hex');
  const payload = {
    "Id": params.id
  };
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': signature,
        'Commerce': secretKey
      },
      body: JSON.stringify(payload)
    });

    const data: ConsultaOpResponse = await response.json();
    return data;

  } catch (error) {
    console.error("Error consultando operación R4:", error);
    throw error;
  }
};