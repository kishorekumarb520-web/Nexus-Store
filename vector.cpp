#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>

using namespace std;

class Student
{
public:
    string name;
    int mark;
    char grade;
};

int main()
{
    vector<Student> students = {
        {"Arun", 85, ' '},
        {"Bala", 72, ' '},
        {"Kumar", 91, ' '},
        {"Ravi", 65, ' '}
    };

    // Sort students based on marks (descending order)
    sort(students.begin(), students.end(),
         [](Student a, Student b)
         {
             return a.mark > b.mark;
         });

    // Assign grades using transform
    transform(students.begin(), students.end(),
              students.begin(),
              [](Student s)
              {
                  if (s.mark >= 90)
                      s.grade = 'A';
                  else if (s.mark >= 75)
                      s.grade = 'B';
                  else if (s.mark >= 50)
                      s.grade = 'C';
                  else
                      s.grade = 'F';
                  return s;
              });

    // Find first student scoring above 80
    auto it = find_if(students.begin(), students.end(),
                      [](Student s)
                      {
                          return s.mark > 80;
                      });

    // Calculate total marks using accumulate
    int total = accumulate(students.begin(), students.end(), 0,
                           [](int sum, Student s)
                           {
                               return sum + s.mark;
                           });

    float average = (float)total / students.size();

    // Display results
    cout << "Student Grade Analyzer\n";
    cout << "-----------------------\n";
    for (const auto &s : students)
    {
        cout << "Name: " << s.name << " | Mark: " << s.mark << " | Grade: " << s.grade << endl;
    }

    cout << "\nTotal Marks: " << total << endl;
    cout << "Average Marks: " << average << endl;

    if (it != students.end())
    {
        cout << "\nFirst student with mark > 80: " << it->name << " (" << it->mark << ")" << endl;
    }

    return 0;
}