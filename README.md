# Patient Health Management Application

A comprehensive web-based patient health management system for post-stroke rehabilitation with real-time IoT device integration.

## Features

- **Real-time Health Monitoring**: Live tracking of heart rate, SpO2, muscle activity, and temperature
- **IoT Device Integration**: MQTT-based communication with smart gloves and sensors
- **Therapy Management**: Schedule and track therapy sessions
- **Data Visualization**: Interactive charts using Chart.js
- **Real-time Updates**: Socket.IO for live data streaming
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

### Backend
- **Node.js** with **Express.js** - RESTful API server
- **Socket.IO** - Real-time communication
- **MySQL** - Database for patient data and health metrics
- **MQTT** - IoT device communication
- **TypeScript** - Type-safe development

### Frontend
- **Next.js 15** - React framework
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Socket.IO Client** - Real-time updates

## Project Structure

```
patient-health-management/
├── server/                    # Backend server
│   ├── src/
│   │   ├── config/           # Database configuration
│   │   ├── routes/           # API routes
│   │   └── index.ts          # Main server file
│   ├── package.json
│   └── tsconfig.json
├── src/                      # Frontend (Next.js)
│   ├── app/
│   │   ├── (patient)/
│   │   │   ├── dashboard/
│   │   │   ├── therapy/
│   │   │   └── progress/
│   │   └── globals.css
│   └── components/
├── database/
│   └── schema.sql           # MySQL database schema
├── PLAN.md                  # Development plan
├── TODO.md                  # Progress tracking
└── README.md               # This file
```

## Quick Start

### 1. Database Setup
```bash
# Create database and tables
mysql -u root -p < database/schema.sql
```

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

### 3. Frontend Setup
```bash
npm install
npm run dev
```

## Environment Configuration

### Backend (.env)
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=sensor_data_iot
DB_PORT=3306

PORT=3001
CLIENT_URL=http://localhost:3000

MQTT_BROKER_HOST=broker.emqx.io
MQTT_BROKER_PORT=1883
MQTT_CLIENT_ID=patient_health_app
```

## API Endpoints

### Health Metrics
- `GET /api/health-metrics` - Get all health metrics
- `GET /api/health-metrics/:patientId` - Get metrics for specific patient
- `POST /api/health-metrics` - Add new health metric

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get specific patient
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Therapy Sessions
- `GET /api/therapy-sessions` - Get all therapy sessions
- `GET /api/therapy-sessions/patient/:patientId` - Get sessions for specific patient
- `POST /api/therapy-sessions` - Create new therapy session
- `PUT /api/therapy-sessions/:id` - Update therapy session
- `DELETE /api/therapy-sessions/:id` - Delete therapy session

## Testing MQTT Integration

### Publish Test Data
```bash
# Health data
mosquitto_pub -h broker.emqx.io -t "patient/1/health" -m '{"heart_rate": 75, "spo2": 98.5, "muscle_activity": 65.2, "temperature": 36.5, "device_id": "smart-glove-001"}'

# Device status
mosquitto_pub -h broker.emqx.io -t "patient/1/device" -m '{"device_id": "smart-glove-001", "status": "online", "last_seen": "2024-01-01T12:00:00Z"}'
```

## Development Commands

### Backend
```bash
cd server
npm run dev          # Development server
npm run build        # Build for production
npm start           # Production server
```

### Frontend
```bash
npm run dev         # Development server
npm run build       # Build for production
npm start          # Production server
```

## Features Overview

### 1. Real-time Health Monitoring
- Live heart rate monitoring
- SpO2 levels tracking
- Muscle activity measurement
- Temperature monitoring

### 2. IoT Device Integration
- MQTT-based device communication
- Real-time device status updates
- Automatic data ingestion
- Device calibration support

### 3. Therapy Management
- Session scheduling
- Progress tracking
- Session notes
- Status management

### 4. Data Visualization
- Interactive charts
- Historical data analysis
- Trend visualization
- Export capabilities

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
