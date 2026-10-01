import { BASE_URL, getAuthToken } from './api';

function uploadError(message, code) {
  const error = new Error(message);
  error.code = code || 'UPLOAD_FAILED';
  return error;
}

export function uploadListingImage(uri, onProgress) {
  return new Promise((resolve, reject) => {
    const body = new FormData();
    body.append('image', {
      uri,
      name: 'listing.jpg',
      type: 'image/jpeg',
    });

    const request = new XMLHttpRequest();
    request.open('POST', `${BASE_URL}/uploads/listing-image`);
    const token = getAuthToken();
    if (token) request.setRequestHeader('Authorization', `Bearer ${token}`);
    request.timeout = 30000;

    request.upload.onprogress = (event) => {
      if (event.lengthComputable && typeof onProgress === 'function') {
        onProgress(event.loaded / event.total);
      }
    };

    request.onerror = () => reject(uploadError('Photo upload failed. Check your connection and try again.', 'NETWORK_ERROR'));
    request.ontimeout = () => reject(uploadError('Photo upload timed out. Please try again.', 'UPLOAD_TIMEOUT'));
    request.onload = () => {
      let payload = null;
      try {
        payload = JSON.parse(request.responseText);
      } catch (_error) {
        payload = null;
      }
      if (request.status >= 200 && request.status < 300 && payload?.data?.image) {
        resolve(payload.data.image);
        return;
      }
      const error = uploadError(payload?.message || 'Photo upload failed', payload?.code || 'UPLOAD_FAILED');
      error.status = request.status;
      reject(error);
    };

    request.send(body);
  });
}

export default { uploadListingImage };
