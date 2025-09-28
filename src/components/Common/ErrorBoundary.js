import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    // ErrorBoundary caught an error

    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div
          style={{
            padding: "20px",
            margin: "20px",
            backgroundColor: "#ffebee",
            border: "1px solid #f44336",
            borderRadius: "4px",
            color: "#c62828",
          }}
        >
          <h2 style={{ color: "#d32f2f", marginTop: 0 }}>
            🚨 Something went wrong
          </h2>

          <p>An unexpected error occurred. This might be due to:</p>

          <ul style={{ paddingLeft: "20px" }}>
            <li>Network connectivity issues</li>
            <li>Invalid configuration</li>
            <li>Browser compatibility problems</li>
            <li>Missing environment variables</li>
          </ul>

          <div style={{ marginTop: "20px" }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: "10px 20px",
                backgroundColor: "#4caf50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginRight: "10px",
              }}
            >
              🔄 Try Again
            </button>

            <button
              onClick={this.handleReload}
              style={{
                padding: "10px 20px",
                backgroundColor: "#2196f3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              🔃 Reload Page
            </button>
          </div>

          {/* Development Error Details */}
          {process.env.NODE_ENV === "development" && this.state.error && (
            <details style={{ marginTop: "20px" }}>
              <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
                Technical Details (Development Mode)
              </summary>
              <div
                style={{
                  marginTop: "10px",
                  padding: "10px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "4px",
                  fontFamily: "monospace",
                  fontSize: "12px",
                  overflow: "auto",
                }}
              >
                <h4>Error:</h4>
                <pre style={{ whiteSpace: "pre-wrap" }}>
                  {this.state.error && this.state.error.toString()}
                </pre>

                <h4>Component Stack:</h4>
                <pre style={{ whiteSpace: "pre-wrap" }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping functional components
export const withErrorBoundary = (Component, fallback = null) => {
  return function WithErrorBoundaryComponent(props) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

// Hook for error boundary functionality in functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error) => {
    // Captured error
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
};

// Simple Error Display Component
export const ErrorDisplay = ({
  error,
  title = "An error occurred",
  onRetry = null,
  showDetails = false,
}) => {
  const errorMessage = error?.message || error?.toString() || "Unknown error";

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#ffebee",
        border: "1px solid #f44336",
        borderRadius: "4px",
        color: "#c62828",
        margin: "10px 0",
      }}
    >
      <h4 style={{ color: "#d32f2f", marginTop: 0 }}>🚨 {title}</h4>

      <p>{errorMessage}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: "8px 16px",
            backgroundColor: "#4caf50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          🔄 Retry
        </button>
      )}

      {showDetails && error && (
        <details style={{ marginTop: "10px" }}>
          <summary style={{ cursor: "pointer" }}>Show Details</summary>
          <pre
            style={{
              marginTop: "10px",
              padding: "10px",
              backgroundColor: "#f5f5f5",
              borderRadius: "4px",
              fontFamily: "monospace",
              fontSize: "12px",
              overflow: "auto",
            }}
          >
            {error.stack || error.toString()}
          </pre>
        </details>
      )}
    </div>
  );
};

export default ErrorBoundary;
