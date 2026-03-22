/**
 * DataUpload Component - Upload và xử lý dữ liệu đơn hàng
 * Hỗ trợ CSV, Excel, JSON với AI processing
 * Tích hợp với backend API
 */
import React, { useState } from 'react';
import {
  Package,
  Upload,
  Download,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { useShippingSLAData } from '../../../hooks/useShippingSLAData';
import logger from "../../../utils/logger";

const DataUpload = () => {
  const {
    orders,
    loading,
    error,
    dataQuality,
    loadDemoData,
    uploadOrdersFile,
  } = useShippingSLAData();

  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Function handle demo data loading
  const handleLoadDemoData = async () => {
    try {
      setIsProcessing(true);
      setUploadProgress(0);

      // Simulate loading progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      await loadDemoData();

      setUploadProgress(100);
      setTimeout(() => {
        setIsProcessing(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      logger.error('Error loading demo data:', error);
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  // Function handle file upload
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    try {
      setIsProcessing(true);
      setUploadProgress(0);

      // Process each file
      for (const file of files) {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + Math.random() * 20;
          });
        }, 300);

        await uploadOrdersFile(file);

        clearInterval(progressInterval);
        setUploadProgress(100);
      }

      setTimeout(() => {
        setIsProcessing(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      logger.error('Error uploading file:', error);
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Package className="w-6 h-6" />
          <h3 className="text-2xl font-bold">Upload & Process Đơn Hàng</h3>
          <span className="bg-yellow-500 text-gray-900 text-xs rounded-full px-2 py-1 font-bold">
            SMART AI
          </span>
        </div>
        <p className="text-purple-100">
          Upload file đa dạng (CSV, Excel, JSON), tự động làm sạch dữ liệu và
          sắp xếp theo SLA. Hỗ trợ không giới hạn dung lượng với AI processing
          thông minh.
        </p>
        {error && (
          <div className="mt-3 p-3 bg-red-500 bg-opacity-20 border border-red-300 rounded-lg">
            <p className="text-red-100 text-sm">❌ {error}</p>
          </div>
        )}
      </div>

      {/* Upload Area */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* File Upload */}
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              dragOver
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-semibold text-gray-700">
                Kéo thả file hoặc click để upload
              </p>
              <p className="text-sm text-gray-500">
                Hỗ trợ CSV, Excel, JSON (tối đa 100MB)
              </p>
              <input
                type="file"
                multiple
                accept=".csv,.xlsx,.json"
                onChange={(e) => handleFileUpload(Array.from(e.target.files))}
                className="hidden"
                id="fileInput"
                disabled={isProcessing || loading}
              />
              <label
                htmlFor="fileInput"
                className={`inline-block px-6 py-2 rounded-lg cursor-pointer transition-colors ${
                  isProcessing || loading
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isProcessing || loading ? 'Đang xử lý...' : 'Chọn Files'}
              </label>
            </div>
          </div>

          {/* Demo Data Button */}
          <button
            onClick={handleLoadDemoData}
            disabled={isProcessing || loading}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing || loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Load Demo Data (50 đơn hàng)</span>
              </>
            )}
          </button>
        </div>

        {/* Data Quality Stats */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">
            Chất Lượng Dữ Liệu
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Đã xử lý
                </span>
              </div>
              <div className="text-2xl font-bold text-green-900 mt-1">
                {dataQuality.clean}
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-800">Lỗi</span>
              </div>
              <div className="text-2xl font-bold text-red-900 mt-1">
                {dataQuality.errors}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Tổng cộng
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-900 mt-1">
                {dataQuality.total}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Trùng lặp
                </span>
              </div>
              <div className="text-2xl font-bold text-yellow-900 mt-1">
                {dataQuality.duplicates}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Progress */}
      {(isProcessing || loading) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="text-lg font-semibold text-blue-900">
              Đang xử lý dữ liệu...
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <div className="text-sm text-blue-700 mt-2">
            {Math.round(uploadProgress)}% hoàn thành
          </div>
        </div>
      )}

      {/* Usage Guide */}
      {orders.length === 0 && !isProcessing && !loading && (
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h4 className="text-lg font-bold text-blue-800 mb-4">
            🚀 Hướng Dẫn Sử Dụng
          </h4>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h5 className="font-semibold text-blue-800">1️⃣ Upload Files</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Click "Load Demo Data" để test</li>
                <li>• Hỗ trợ CSV, Excel, JSON</li>
                <li>• Không giới hạn dung lượng</li>
                <li>• Multiple files cùng lúc</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h5 className="font-semibold text-green-800">2️⃣ AI Processing</h5>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Tự động detect format</li>
                <li>• Làm sạch và chuẩn hóa data</li>
                <li>• Tính toán SLA tự động</li>
                <li>• Suggest nhà vận chuyển</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h5 className="font-semibold text-purple-800">
                3️⃣ Smart Management
              </h5>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Sắp xếp theo SLA priority</li>
                <li>• Bộ lọc thông minh</li>
                <li>• Bulk actions</li>
                <li>• Export và reporting</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {orders.length > 0 && !isProcessing && !loading && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">
              ✅ Đã tải thành công {orders.length} đơn hàng và xử lý tự động!
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataUpload;
