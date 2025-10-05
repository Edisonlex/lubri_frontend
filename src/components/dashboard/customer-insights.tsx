"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Users, Star } from "lucide-react"
import { motion } from "framer-motion"

const customerData = [
  { label: "Clientes Frecuentes", value: 68, total: 100 },
  { label: "Nuevos este Mes", value: 12, total: 20 },
  { label: "Satisfacción", value: 92, total: 100 },
]

export function CustomerInsights() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Insights de Clientes
          </CardTitle>
          <CardDescription>Métricas de satisfacción y retención</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customerData.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">
                    {item.value}
                    {item.label === "Satisfacción" ? "%" : ""}
                  </span>
                </div>
                <Progress value={(item.value / item.total) * 100} className="h-2" />
              </motion.div>
            ))}

            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>4.6/5 calificación promedio</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
