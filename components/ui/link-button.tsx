"use client";

import Link from "next/link";
import { Button, type ButtonProps } from "@/components/ui/button";

interface LinkButtonProps extends Omit<ButtonProps, "render"> {
  href: string;
}

export function LinkButton({
  href,
  children,
  ...props
}: Readonly<LinkButtonProps>) {
  return (
    <Button
      render={(renderProps) => <Link href={href} {...renderProps} />}
      {...props}
    >
      {children}
    </Button>
  );
}
