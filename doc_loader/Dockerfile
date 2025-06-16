FROM python:3.11-slim
# Set the working directory
WORKDIR /app
# Copy the requirements file
COPY requirements.txt .
# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt
# create user 
RUN useradd -m efaiuser
RUN echo "User efaiuser created"
# Copy the application code
COPY . .
# Command to run the application
CMD ["/bin/sh", "-c", "pwd && ls && /app/start_service.sh"]