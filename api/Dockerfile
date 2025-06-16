FROM python:3.11-slim
# Set the working directory
WORKDIR /app
# Copy the requirements file
COPY requirements.txt .
# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt
# create user 
RUN useradd -m efaiuser
# Copy the application code
COPY ./app ./app
EXPOSE 8000
# Command to run the application
CMD ["/bin/sh", "start_service.sh"]