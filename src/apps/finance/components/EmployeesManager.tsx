import { format } from 'date-fns';
import { Building, Edit, Trash2, Plus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEmployees, EmployeeInsert, EmployeeUpdate } from '../hooks/useEmployees';
import { EmployeeForm } from './forms/EmployeeForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const EmployeesManager = () => {
  const { employees, loading, addEmployee, updateEmployee, deleteEmployee, totalSalary } = useEmployees();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 border-2 border-foreground">
        <div className="text-muted-foreground font-mono text-sm uppercase tracking-widest">
          Loading...
        </div>
      </div>
    );
  }

  const monthlyPayroll = totalSalary / 12;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-foreground pb-4">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-tight">Employees</h2>
          <p className="text-sm font-mono text-muted-foreground uppercase mt-1">
            Manage W-2 employee salaries
          </p>
        </div>
        <EmployeeForm onSubmit={addEmployee} />
      </div>

      {/* Info Box */}
      <div className="border-2 border-foreground p-4 bg-muted/30">
        <div className="flex items-start gap-3">
          <Building className="w-5 h-5 mt-0.5" />
          <div>
            <p className="font-bold uppercase text-sm">S-Corp Owner Salary</p>
            <p className="text-xs font-mono text-muted-foreground mt-1">
              As an S-Corp owner in Virginia, you must pay yourself a "reasonable salary" as a W-2 employee. 
              This salary is subject to FICA taxes (7.65% employer + 7.65% employee), but distributions beyond 
              salary avoid the 15.3% self-employment tax. The IRS scrutinizes S-Corp salaries, so ensure it's 
              reasonable for your industry.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-0">
        <div className="border-2 border-foreground border-r-0 sm:border-r-2 p-4">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Employees</p>
          <p className="text-2xl font-bold mt-2 tabular-nums">
            {employees.length}
          </p>
        </div>
        <div className="border-2 border-foreground border-t-0 sm:border-t-2 border-r-0 sm:border-r-2 p-4">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Annual Payroll</p>
          <p className="text-2xl font-bold mt-2 tabular-nums text-primary">
            ${totalSalary.toLocaleString()}
          </p>
        </div>
        <div className="border-2 border-foreground border-t-0 sm:border-t-2 p-4">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Monthly Payroll</p>
          <p className="text-2xl font-bold mt-2 tabular-nums text-primary">
            ${monthlyPayroll.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Table */}
      {employees.length === 0 ? (
        <div className="border-2 border-foreground p-12 text-center">
          <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-bold uppercase mb-2">No Employees</h3>
          <p className="text-sm font-mono text-muted-foreground uppercase mb-4">
            Add yourself as a W-2 employee
          </p>
          <EmployeeForm onSubmit={addEmployee} />
        </div>
      ) : (
        <div className="border-2 border-foreground overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-foreground bg-muted/30">
                  <th className="text-left p-3 text-xs font-mono uppercase tracking-widest">Name</th>
                  <th className="text-right p-3 text-xs font-mono uppercase tracking-widest">Annual Salary</th>
                  <th className="text-right p-3 text-xs font-mono uppercase tracking-widest">Monthly</th>
                  <th className="text-right p-3 text-xs font-mono uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee, index) => (
                  <tr
                    key={employee.id}
                    className={index < employees.length - 1 ? "border-b border-foreground/30" : ""}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-bold">{employee.name}</span>
                        <span className="text-xs font-mono uppercase bg-foreground text-background px-2 py-0.5">
                          W-2
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono font-bold tabular-nums text-primary">
                      ${Number(employee.salary).toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono tabular-nums text-muted-foreground">
                      ${(Number(employee.salary) / 12).toLocaleString()}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <EmployeeForm
                          initialData={employee}
                          onSubmit={(data) => updateEmployee(employee.id, data)}
                          trigger={
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                              <Edit className="w-4 h-4" />
                            </Button>
                          }
                        />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary hover:text-primary-foreground">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="border-2 border-foreground rounded-none">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="uppercase tracking-wide">Delete Employee?</AlertDialogTitle>
                              <AlertDialogDescription className="font-mono text-sm">
                                This will permanently delete {employee.name}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-2 border-foreground rounded-none">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteEmployee(employee.id)}
                                className="bg-primary text-primary-foreground rounded-none"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FICA Tax Info */}
      {employees.length > 0 && (
        <div className="border-2 border-foreground p-4">
          <h3 className="text-xs font-mono uppercase tracking-widest mb-3">Estimated Annual Payroll Taxes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-mono text-muted-foreground">Employer FICA (7.65%)</p>
              <p className="font-bold tabular-nums">${(totalSalary * 0.0765).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-mono text-muted-foreground">Employee FICA (7.65%)</p>
              <p className="font-bold tabular-nums">${(totalSalary * 0.0765).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-mono text-muted-foreground">Total FICA</p>
              <p className="font-bold tabular-nums text-primary">${(totalSalary * 0.153).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
