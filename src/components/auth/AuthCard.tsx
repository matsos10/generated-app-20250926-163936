import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot } from 'lucide-react';
import { motion } from 'framer-motion';
interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footerContent: React.ReactNode;
}
export function AuthCard({ title, description, children, footerContent }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <Link to="/" className="inline-flex items-center justify-center space-x-2">
              <Bot className="h-10 w-10 text-primary" />
            </Link>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              {children}
            </CardContent>
            <CardFooter>
              <div className="text-sm text-center w-full">
                {footerContent}
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}