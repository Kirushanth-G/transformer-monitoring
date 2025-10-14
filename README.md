# Transformer Monitoring System
## Application hosting

Application is hosted on AWS platform as follows (currently not available).

![alt text](<Your paragraph text.png>)

## How to Access the Application

You have two options to view and interact with the Transformer Monitoring System:

### Option 1: Live Website (Recommended for Quick Access)

🌐 **Visit the deployed application (currently not available):**
[http://react-powergrid.s3-website-ap-southeast-1.amazonaws.com/transformers](http://react-powergrid.s3-website-ap-southeast-1.amazonaws.com/transformers)

This is a live deployment of the application that you can access immediately without any setup.

### Option 2: Run Complete System Locally (For Development)

🔧 **Run the full application stack on your local machine**

Follow the setup instructions below to run all three services locally.

## How to Run the Complete System Locally

### Prerequisites

Before running this project locally, make sure you have the following installed:

#### Required Software

1. **Node.js** (version 18.0.0 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **npm** (version 9.0.0 or higher)
   - Usually comes with Node.js
   - Verify installation: `npm --version`

3. **Java** (version 21 or higher)
   - Download from [oracle.com](https://www.oracle.com/java/technologies/downloads/) or use OpenJDK
   - Verify installation: `java --version`

4. **Maven** (version 3.6.0 or higher)
   - Download from [maven.apache.org](https://maven.apache.org/)
   - Verify installation: `mvn --version`

5. **Python** (version 3.8 or higher)
   - Download from [python.org](https://www.python.org/downloads/)
   - Verify installation: `python --version`

6. **uv** (Python package manager)
   - Install from [github.com/astral-sh/uv](https://github.com/astral-sh/uv)
   - Verify installation: `uv --version`

#### Development Tools (Recommended)

1. **Visual Studio Code**
   - Recommended extensions:
     - ES7+ React/Redux/React-Native snippets
     - Prettier - Code formatter
     - ESLint
     - Extension Pack for Java
     - Python

### Setup Instructions

#### 1. Environment Variables Setup

**Set environment variables for backend:**(no need)
```bash
export PSQL_USER=your_postgres_username
export PSQL_PASSWORD=your_postgres_password
export AWS_ACCESS_KEY=your_aws_access_key
export AWS_SECRET_KEY=your_aws_secret_key
```

*Note: Database is hosted on AWS RDS, so no local PostgreSQL setup is required.*

#### 2. Backend (Spring Boot) Setup

1. **Navigate to the backend directory:**
   ```bash
   cd server-transformer
   ```

2. **Install dependencies and build:**
   ```bash
   mvn clean install
   ```

3. **Run the backend server:**
   ```bash
   mvn spring-boot:run --spring.profiles.active=local
   ```

4. **Backend will be available at:** `http://localhost:8080`

#### 3. CV Service (Python FastAPI) Setup

1. **Navigate to the CV service directory:**
   ```bash
   cd cv_service
   ```

2. **Install dependencies using uv:**
   ```bash
   uv sync
   ```

3. **Run the CV service:**
   ```bash
   uv run uvicorn thermal_detector.main:app --host 0.0.0.0 --port 8000
   ```

4. **CV service will be available at:** `http://localhost:8000`

#### 4. Frontend (React) Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd client-side
   ```

2. **Update axios configuration for local development:**
   - Edit `src/api/axiosConfig.js`
   - Uncomment the localhost configuration:
   ```javascript
   export default axios.create({
     baseURL: 'http://localhost:8080',
   });
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   Open your browser and go to `http://localhost:5173`

### Running Order

**Start services in this order for proper functionality:**

1. **Backend** (Spring Boot) - `http://localhost:8080`
2. **CV Service** (FastAPI) - `http://localhost:8000`
3. **Frontend** (React) - `http://localhost:5173`

*Note: Database is hosted on AWS RDS and doesn't require local setup.*

The development servers will automatically reload when you make changes to the code.

## Tech Stack

### Frontend (client-side/)
- **Framework:** React 19.1.0
- **Build Tool:** Vite
- **Styling:** Tailwindcss
- **HTTP Client:** Axios
- **Routing:** React Router
- **Development Server Port:** 5173

### Backend (server-transformer/)
- **Framework:** Spring Boot 3.5.4
- **Language:** Java 21
- **Database:** PostgreSQL
- **Migration Tool:** Flyway
- **ORM:** Hibernate/JPA
- **Server Port:** 8080

### CV Service (cv_service/)
- **Framework:** FastAPI
- **Language:** Python 3.8+
- **Computer Vision:** OpenCV, TensorFlow/PyTorch
- **Server Port:** 8000

### Database
- **Database:** PostgreSQL (hosted on AWS RDS)
- **No local database setup required**

## Available Scripts

### Frontend (client-side/)
- `npm run dev` - Start development server on port 5173
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

### Backend (server-transformer/)
- `mvn spring-boot:run` - Start Spring Boot server on port 8080
- `mvn clean install` - Build and install dependencies
- `mvn test` - Run tests
- `mvn clean package` - Package JAR file

### CV Service (cv_service/)
- `uv run uvicorn thermal_detector.main:app --host 0.0.0.0 --port 8000` - Start FastAPI server on port 8000
- `uv sync` - Install Python dependencies using uv
- `uv add <package>` - Add new Python dependencies

## list of implemented features

1. transformer page crud (add, edit, delete, view)
2. view inspections done on a transformer
3. baseline image for transformer(add, view, delete)
4. inspection page crud (add, edit, delete, view)
5. inspection image (add, view, delete)
6. compare baseline image with inspection image
7. pagination for inspection and transformer page(implemented in backend, which makes data loading efficient)
8. filters for both pages
9. message bar (success message, error message pop up)
10. mobile responsive design

## todo (known limitations for now)

1. filtering option should be shifted to backend (filters implemented on front end which makes the filter option to work only on the specific page)
2. sorting option should be shifted to backend.
