package git

import (
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"testing"

	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/go-git/go-git/v5/plumbing/object"
	"github.com/pkg/errors"
	"github.com/portainer/portainer/api/archive"
	"github.com/stretchr/testify/assert"
)

var bareRepoDir string

func TestMain(m *testing.M) {
	if err := testMain(m); err != nil {
		log.Fatal(err)
	}
}

// testMain does extra setup/teardown before/after testing.
// The function is separated from TestMain due to necessity to call os.Exit/log.Fatal in the latter.
func testMain(m *testing.M) error {
	dir, err := ioutil.TempDir("", "git-repo-")
	if err != nil {
		return errors.Wrap(err, "failed to create a temp dir")
	}
	defer os.RemoveAll(dir)

	bareRepoDir = filepath.Join(dir, "test-clone.git")

	file, err := os.OpenFile("./testdata/test-clone-git-repo.tar.gz", os.O_RDONLY, 0755)
	if err != nil {
		return errors.Wrap(err, "failed to open an archive")
	}
	err = archive.ExtractTarGz(file, dir)
	if err != nil {
		return errors.Wrapf(err, "failed to extract file from the archive to a folder %s\n", dir)
	}

	m.Run()

	return nil
}

func Test_ClonePublicRepository_Shallow(t *testing.T) {
	service := Service{git: gitClient{preserveGitDirectory: true}} // no need for http client since the test access the repo via file system.
	repositoryURL := bareRepoDir
	referenceName := "refs/heads/main"
	destination := "shallow"

	dir, err := ioutil.TempDir("", destination)
	if err != nil {
		t.Fatalf("failed to create a temp dir")
	}
	defer os.RemoveAll(dir)
	t.Logf("Cloning into %s", dir)
	err = service.CloneRepository(dir, repositoryURL, referenceName, "", "")
	assert.NoError(t, err)
	assert.Equal(t, 1, getCommitHistoryLength(t, err, dir), "cloned repo has incorrect depth")
}

func Test_ClonePublicRepository_NoGitDirectory(t *testing.T) {
	service := Service{git: gitClient{preserveGitDirectory: false}} // no need for http client since the test access the repo via file system.
	repositoryURL := bareRepoDir
	referenceName := "refs/heads/main"
	destination := "shallow"

	dir, err := ioutil.TempDir("", destination)
	if err != nil {
		t.Fatalf("failed to create a temp dir")
	}

	defer os.RemoveAll(dir)

	t.Logf("Cloning into %s", dir)
	err = service.CloneRepository(dir, repositoryURL, referenceName, "", "")
	assert.NoError(t, err)
	assert.NoDirExists(t, filepath.Join(dir, ".git"))
}

func Test_cloneRepository(t *testing.T) {
	service := Service{git: gitClient{preserveGitDirectory: true}} // no need for http client since the test access the repo via file system.

	repositoryURL := bareRepoDir
	referenceName := "refs/heads/main"
	destination := "shallow"

	dir, err := ioutil.TempDir("", destination)
	if err != nil {
		t.Fatalf("failed to create a temp dir")
	}
	defer os.RemoveAll(dir)
	t.Logf("Cloning into %s", dir)

	err = service.cloneRepository(dir, cloneOptions{
		repositoryUrl: repositoryURL,
		referenceName: referenceName,
		depth:         10,
	})

	assert.NoError(t, err)
	assert.Equal(t, 4, getCommitHistoryLength(t, err, dir), "cloned repo has incorrect depth")
}

func Test_latestCommitID(t *testing.T) {
	service := Service{git: gitClient{preserveGitDirectory: true}} // no need for http client since the test access the repo via file system.

	repositoryURL := bareRepoDir
	referenceName := "refs/heads/main"

	id, err := service.LatestCommitID(repositoryURL, referenceName, "", "")

	assert.NoError(t, err)
	assert.Equal(t, "68dcaa7bd452494043c64252ab90db0f98ecf8d2", id)
}

func getCommitHistoryLength(t *testing.T, err error, dir string) int {
	repo, err := git.PlainOpen(dir)
	if err != nil {
		t.Fatalf("can't open a git repo at %s with error %v", dir, err)
	}
	iter, err := repo.Log(&git.LogOptions{All: true})
	if err != nil {
		t.Fatalf("can't get a commit history iterator with error %v", err)
	}
	count := 0
	err = iter.ForEach(func(_ *object.Commit) error {
		count++
		return nil
	})
	if err != nil {
		t.Fatalf("can't iterate over the commit history with error %v", err)
	}
	return count
}

func Test_listRemote(t *testing.T) {
	service := Service{git: gitClient{
		preserveGitDirectory: true,
		repoRefCache:         make(map[string][]*plumbing.Reference),
		repoTreeCache:        make(map[string][]string),
	}}

	type expectResult struct {
		err       error
		refsCount int
	}

	tests := []struct {
		name   string
		url    string
		expect expectResult
	}{
		{
			name: "list refs of a real repository",
			url:  bareRepoDir,
			expect: expectResult{
				err:       nil,
				refsCount: 1,
			},
		},
		{
			name: "list refs of a fake repository",
			url:  bareRepoDir + "fake",
			expect: expectResult{
				err:       ErrIncorrectRepositoryURL,
				refsCount: 0,
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			refs, err := service.ListRemote(tt.url, "", "")
			if tt.expect.err == nil {
				assert.NoError(t, err)
				assert.Equal(t, tt.expect.refsCount, len(refs))
			} else {
				assert.Error(t, err)
				assert.Equal(t, tt.expect.err, err)
			}
		})
	}
}

func Test_listTree(t *testing.T) {
	service := Service{git: gitClient{
		preserveGitDirectory: true,
		repoRefCache:         make(map[string][]*plumbing.Reference),
		repoTreeCache:        make(map[string][]string),
	}} // no need for http client since the test access the repo via file system.

	type expectResult struct {
		err          error
		matchedCount int
	}

	tests := []struct {
		name   string
		url    string
		ref    string
		exts   []string
		expect expectResult
	}{
		{
			name: "list tree with real repository and head ref",
			url:  bareRepoDir,
			ref:  "refs/heads/main",
			exts: []string{},
			expect: expectResult{
				err:          nil,
				matchedCount: 2,
			},
		},
		{
			name: "list tree with real repository and head ref and existing file extension",
			url:  bareRepoDir,
			ref:  "refs/heads/main",
			exts: []string{"yml"},
			expect: expectResult{
				err:          nil,
				matchedCount: 1,
			},
		},
		{
			name: "list tree with real repository and head ref and non-existing file extension",
			url:  bareRepoDir,
			ref:  "refs/heads/main",
			exts: []string{"hcl"},
			expect: expectResult{
				err:          nil,
				matchedCount: 0,
			},
		},
		{
			name: "list tree with real repository but non-existing ref",
			url:  bareRepoDir,
			ref:  "refs/fake/feature",
			exts: []string{},
			expect: expectResult{
				err: ErrRefNotFound,
			},
		},
		{
			name: "list tree with fake repository ",
			url:  bareRepoDir + "fake",
			ref:  "refs/fake/feature",
			exts: []string{},
			expect: expectResult{
				err: ErrIncorrectRepositoryURL,
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			paths, err := service.ListTree(tt.url, tt.ref, "", "", tt.exts)
			if tt.expect.err == nil {
				assert.NoError(t, err)
				assert.Equal(t, tt.expect.matchedCount, len(paths))
			} else {
				assert.Error(t, err)
				assert.Equal(t, tt.expect.err, err)
			}
		})
	}
}
