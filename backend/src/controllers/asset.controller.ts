import type { Request, Response } from 'express';
import { assetService } from '../services/asset.service.js';
import { buildApiResponse } from '../utils/api-response.js';

const id = (req: Request) => Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
const errorResponse = (res: Response, error: unknown, fallback: string) => {
  const message = error instanceof Error ? error.message : fallback;
  const status = message.includes('not found') ? 404 : message.includes('Forbidden') ? 403 : 400;
  return res.status(status).json(buildApiResponse(message, null, [message]));
};

export const listAssets = async (req: Request, res: Response) => { try { return res.json(buildApiResponse('Assets retrieved successfully', await assetService.list(req.query as any))); } catch (e) { return errorResponse(res, e, 'Failed to list assets'); } };
export const getAsset = async (req: Request, res: Response) => { try { return res.json(buildApiResponse('Asset retrieved successfully', await assetService.get(id(req)))); } catch (e) { return errorResponse(res, e, 'Failed to get asset'); } };
export const createAsset = async (req: Request, res: Response) => { try { return res.status(201).json(buildApiResponse('Asset created successfully', await assetService.create(req.body, (req as any).user.id))); } catch (e) { return errorResponse(res, e, 'Failed to create asset'); } };
export const updateAsset = async (req: Request, res: Response) => { try { return res.json(buildApiResponse('Asset updated successfully', await assetService.update(id(req), req.body, (req as any).user.id))); } catch (e) { return errorResponse(res, e, 'Failed to update asset'); } };
export const deleteAsset = async (req: Request, res: Response) => { try { return res.json(buildApiResponse('Asset retired successfully', await assetService.delete(id(req), (req as any).user.id))); } catch (e) { return errorResponse(res, e, 'Failed to retire asset'); } };
export const assignAsset = async (req: Request, res: Response) => { try { return res.status(201).json(buildApiResponse('Asset assigned successfully', await assetService.assign(id(req), req.body.userId, req.body.notes, (req as any).user.id))); } catch (e) { return errorResponse(res, e, 'Failed to assign asset'); } };
export const returnAsset = async (req: Request, res: Response) => { try { return res.json(buildApiResponse('Asset returned successfully', await assetService.returnAsset(id(req), req.body?.notes, (req as any).user.id))); } catch (e) { return errorResponse(res, e, 'Failed to return asset'); } };
export const listHistory = async (req: Request, res: Response) => { try { return res.json(buildApiResponse('Asset history retrieved successfully', await assetService.history(id(req), req.query.page as any, req.query.limit as any))); } catch (e) { return errorResponse(res, e, 'Failed to list asset history'); } };
export const listCategories = async (req: Request, res: Response) => { try { return res.json(buildApiResponse('Asset categories retrieved successfully', await assetService.categories(Number(req.query.page) || 1, Number(req.query.limit) || 10))); } catch (e) { return errorResponse(res, e, 'Failed to list asset categories'); } };
export const createCategory = async (req: Request, res: Response) => { try { return res.status(201).json(buildApiResponse('Asset category created successfully', await assetService.createCategory(req.body))); } catch (e) { return errorResponse(res, e, 'Failed to create asset category'); } };
export const updateCategory = async (req: Request, res: Response) => { try { return res.json(buildApiResponse('Asset category updated successfully', await assetService.updateCategory(id(req), req.body))); } catch (e) { return errorResponse(res, e, 'Failed to update asset category'); } };
export const deleteCategory = async (req: Request, res: Response) => { try { return res.json(buildApiResponse('Asset category deleted successfully', await assetService.deleteCategory(id(req)))); } catch (e) { return errorResponse(res, e, 'Failed to delete asset category'); } };
export const employeeAssets = async (req: Request, res: Response) => { try { return res.json(buildApiResponse('Employee assets retrieved successfully', await assetService.employeeAssets((req as any).user.id, Number(req.query.page) || 1, Number(req.query.limit) || 10))); } catch (e) { return errorResponse(res, e, 'Failed to list employee assets'); } };
