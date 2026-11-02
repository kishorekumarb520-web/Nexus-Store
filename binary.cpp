#include <iostream>
#include <fstream>
#include <cstring>
#include <memory>
using namespace std;

// Custom Allocator
template <typename T>
class CustomAllocator {
public:
    using value_type = T;

    CustomAllocator() {}
    template <typename U>
    CustomAllocator(const CustomAllocator<U>&) {}

    T* allocate(size_t n) {
        cout << "Allocating memory for " << n << " object(s)\n";
        return static_cast<T*>(::operator new(n * sizeof(T)));
    }

    void deallocate(T* p, size_t n) {
        cout << "Deallocating memory\n";
        ::operator delete(p);
    }
};

// File Record
struct FileRecord {
    char fileName[50];
    int fileSize;
};

// Add file record
void addFile() {
    FileRecord file;
    cout << "Enter File Name: ";
    cin >> file.fileName;
    cout << "Enter File Size (KB): ";
    cin >> file.fileSize;

    ofstream outFile("filesystem.dat", ios::binary | ios::app);
    if (outFile) {
        outFile.write(reinterpret_cast<char*>(&file), sizeof(FileRecord));
        outFile.close();
        cout << "File record added successfully.\n";
    } else {
        cout << "Unable to open file.\n";
    }
}

// Display file records
void displayFiles() {
    ifstream inFile("filesystem.dat", ios::binary);
    if (!inFile) {
        cout << "No file records found.\n";
        return;
    }

    FileRecord file;
    cout << "\n--- File System Records ---\n";
    while (inFile.read(reinterpret_cast<char*>(&file), sizeof(FileRecord))) {
        cout << "File Name: " << file.fileName << endl;
        cout << "File Size: " << file.fileSize << " KB\n";
        cout << "---------------------\n";
    }
    inFile.close();
}

int main() {
    int choice;
    do {
        cout << "\nMINI FILE SYSTEM SIMULATOR\n";
        cout << "1. Add File\n";
        cout << "2. Display Files\n";
        cout << "3. Exit\n";
        cout << "Enter your choice: ";
        cin >> choice;

        switch (choice) {
        case 1:
            addFile();
            break;
        case 2:
            displayFiles();
            break;
        case 3:
            cout << "Exiting File System Simulator...\n";
            break;
        default:
            cout << "Invalid choice.\n";
        }
    } while (choice != 3);

    return 0;
}