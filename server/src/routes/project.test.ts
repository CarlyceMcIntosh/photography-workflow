import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';

describe('Project API', () => {
  let authToken: string;
  let testProjectId: string;

  // Get auth token before running tests
  beforeAll(async () => {
    // TODO: We'll add login logic here
    authToken = 'eyJhbGciOiJFUzI1NiIsImtpZCI6ImU1OTk5Mzc5LWU1ZmYtNGU3Yy05ZWQxLTcyYjUzNGQ1YTQwMyIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2FleGdkcnF2Y21xdXludXlhdWNwLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJkYmE5OTM1Zi03Y2Q0LTQ5ZGUtOThiOS00YzZkNmQwMGYyYzciLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzg5MzIwNzYzLCJpYXQiOjE3ODkzMTcxNjMsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWxfdmVyaWZpZWQiOnRydWV9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzg5MzE3MTYzfV0sInNlc3Npb25faWQiOiI2N2I1Njg1Yy0wYzU1LTQ4Y2YtYTE0YS1kNmEyNDhiM2JjOTkiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.akkg8i7WYKJ53rAFoSCpjzmimudGHMaTVJGE7GuilesZVlfug5TjGtH5yHcjMAvSAai5OJ5-m3T1bwOnf5Dhdg'; // Temporarily hardcode
  });

  describe('POST /api/projects', () => {
    it('should create a new project', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Project',
          session_location: 'Test Location'
        });

      expect(response.status).toBe(201);
      expect(response.body.project).toBeDefined();
      expect(response.body.project.name).toBe('Test Project');
      expect(response.body.project.workflow_state).toBe('DRAFT');

      // Save for later tests
      testProjectId = response.body.project.id;
    });

    it('should reject invalid project data', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '' // Invalid: empty name
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject request without auth token', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({ name: 'Test' });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/projects', () => {
    it('should list user projects', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.projects).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/projects/:id', () => {
    it('should get a single project', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.project.id).toBe(testProjectId);
    });

    it('should return 404 for non-existent project', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/projects/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/projects/:id', () => {
    it('should update a project', async () => {
      const response = await request(app)
        .patch(`/api/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          session_location: 'Updated Location',
          selection_limit: 30
        });

      expect(response.status).toBe(200);
      expect(response.body.project.session_location).toBe('Updated Location');
      expect(response.body.project.selection_limit).toBe(30);
    });
  });
});