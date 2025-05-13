// Request Models

export interface SchoolRequest {
  requestId: number;
  firstName: string;
  lastName: string;
  phoneNr: string;
  drivingCategory: string;
  requestDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface CreateRequestPayload {
  firstName: string;
  lastName: string;
  phoneNr: string;
  drivingCategory: string;
}

export interface UpdateRequestStatusPayload {
  status: 'APPROVED' | 'REJECTED';
}
