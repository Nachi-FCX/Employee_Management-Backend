import { Request, Response } from "express";
import prisma from "../prisma";

/**
 * CREATE ROLE
 */
export const createRole = async (req: Request, res: Response) => {
  try {
    const { role_name, description } = req.body;

    const role = await prisma.roles.create({
      data: { role_name, description },
    });

    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ message: "Error creating role", error });
  }
};

/**
 * GET ALL ROLES
 */
export const getRoles = async (_req: Request, res: Response) => {
  try {
    const roles = await prisma.roles.findMany();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching roles", error });
  }
};

/**
 * UPDATE ROLE
 */
export const updateRole = async (req: Request, res: Response) => {
  try {
    const role_id = Number(req.params.id);
    const { role_name, description } = req.body;

    const role = await prisma.roles.update({
      where: { role_id },
      data: { role_name, description },
    });

    res.json(role);
  } catch (error) {
    res.status(500).json({ message: "Error updating role", error });
  }
};

/**
 * DELETE ROLE
 */
export const deleteRole = async (req: Request, res: Response) => {
  try {
    const role_id = Number(req.params.id);

    await prisma.roles.delete({
      where: { role_id },
    });

    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting role", error });
  }
};
