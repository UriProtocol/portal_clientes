"use client"
import Divider from "@/components/misc/Divider";
import { useAuth } from "@/hooks/auth/auth";
import { Button, Card, Chip } from "@heroui/react";
import Link from "next/link";
import { FaArrowRight, FaBagShopping, FaFileInvoice } from "react-icons/fa6";

export default function Dashboard() {
  const { user } = useAuth()

  if(!user) return <></>
  
  return (
    <>
      <h1 className="font-semibold text-5xl text-center text-black/90">
        Hola,
        <span className="text-datia-primary font-extrabold text-5xl ml-1">
          {user?.name ?? ""}
        </span>
      </h1>
      <h2 className=" text-center mt-6 text-xl text-datia-gray">
        Opera pedidos, seguimiento, estado de cuenta y facturas sin llamar a sucursal.
      </h2>
      <Divider className=" my-4" />
      <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto text-center">
        <Card>
          <Chip className=" p-4 rounded-full mx-auto bg-datia-primary/20">
            <FaBagShopping className="text-xl text-datia-primary"/>
          </Chip>
          <Card.Header>
            <Card.Title className=" font-semibold text-xl mt-1 mb-4">Hacer un pedido</Card.Title>
            <Card.Description>
             Arma tu carrito en línea y envíelo a aprobación en el ERP.
            </Card.Description>
          </Card.Header>
          <Card.Footer>
            <Link href={"/pedidos"} className="mx-auto mt-1">
              <Button size="lg" variant="primary">
                  Ir a pedir
                  <FaArrowRight />
              </Button>
            </Link>
          </Card.Footer>
        </Card>
        <Card>
            <Chip className=" p-4 rounded-full mx-auto bg-yellow-600/20">
            <FaFileInvoice className="text-xl text-yellow-600"/>
          </Chip>
          <Card.Header>
            <Card.Title className=" font-semibold text-xl mt-1 mb-4">Descargar facturas</Card.Title>
            <Card.Description>
             Consulta y descarga PDF o XML de sus CFDIs emitidos.
            </Card.Description>
          </Card.Header>
          <Card.Footer>
            <Link href={"/facturas"} className="mx-auto mt-1">
              <Button size="lg"  className="bg-yellow-600 hover:opacity-90 text-white">
                  Ver facturas
                  <FaArrowRight />
              </Button>
            </Link>
          </Card.Footer>
        </Card>
      </div>
      <Divider className=" my-4" />
      <div className="grid grid-cols-2 gap-4 text-center max-w-3xl mx-auto">
        <div className="flex flex-col gap-3">
          <p className="text-datia-gray text-sm font-semibold">SALDO PENDIENTE</p>
          <p className=" text-3xl font-semibold text-green-700">
            $10,000.00
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-datia-gray text-sm font-semibold">PEDIDOS EN CURSO</p>
          <p className=" text-3xl font-semibold text-datia-primary">
            2
          </p>
        </div>
      </div>
    </>
  );
}
